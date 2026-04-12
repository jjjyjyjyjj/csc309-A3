const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class QualificationService {
    static async getAll(keyword, page, limit){
        const validStatuses= ["submitted", "revised", "created"];

        const where = {status: {in: validStatuses }};
        
        if (keyword) {
            where.reg_user = {
                OR: [{ first_name: { contains: keyword} },
                    { last_name: { contains: keyword } },
                    { email: { contains: keyword} },
                    { phone_number: { contains: keyword} }
                ]
            };
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const [qualifications, total] = await Promise.all([
            prisma.qualification.findMany({
                where: where,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                include: {
                    reg_user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                        }
                    },
                    position_type: {
                        select: {
                            position_id: true,
                            name: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.qualification.count({ where: where })
        ]);

        return { count: total,
                results: qualifications.map(qual => {return{
                id: qual.qualification_id,
                status: qual.status,
                note: qual.note,
                document: qual.document,
                updatedAt: qual.updatedAt,
                user: {
                    id: qual.reg_user.id,
                    first_name: qual.reg_user.first_name,
                    last_name: qual.reg_user.last_name
                },
                position_type: {
                    id: qual.position_type.position_id,
                    name: qual.position_type.name
                }
            }})
        };
    };

    static async create(position_type_id, note, userId){
        if (!position_type_id){throw new Error("Bad Request -  position_type_id is required")};
        if (!userId) {throw new Error("Bad Request - userId is required")};

        const positionType = await prisma.positionType.findUnique({where: {position_id: parseInt(position_type_id)}});
        if  (!positionType){
            throw new Error("Not Found - position type does not exist");
        } 

        const existingQual = await prisma.qualification.findFirst({
            where: {
                user_id: userId,
                position_id: parseInt(position_type_id)
            }
        });

        if (existingQual) {
            throw new Error("User already has a qualification for this position type");
        }

        const qualification = await prisma.qualification.create({
            data: {
                position_id: parseInt(position_type_id),
                note: note || "",
                user_id: userId,
                status: "created"
            },
            include: {
                reg_user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                position_type: {
                    select: {
                        position_id: true,
                        name: true
                    }
                }
            }
        });

        return {
            id: qualification.qualification_id,
            status: qualification.status,
            note: qualification.note,
            document: qualification.document,
            user: {
                id: qualification.reg_user.id,
                first_name: qualification.reg_user.first_name,
                last_name: qualification.reg_user.last_name,
            },
            position_type:{
                id: qualification.position_type.position_id,
                name: qualification.position_type.name
            },
            updatedAt: qualification.updatedAt
        };
    };

    static async getOne(qualificationId, user){
        const qualification = await prisma.qualification.findUnique({
            where:{qualification_id: qualificationId}, include: {
            position_type: true,
            reg_user: true}});

        if (!qualification){
            throw new Error("Not Found - qualification not found");
        }    

        if (user.role === "regular" && qualification.user_id !== user.userId){
            throw new Error("Not Found - user trying to upload doc for another persons qualification");
        }

        const isBusiness = (user.role === "business");
        // a business attempts to view a non-approved qualification
        if (isBusiness) {
            if (qualification.status !=="approved"){
            throw new Error("Forbidden - businesss tryna view non-approaved qualification");
        };
        
            // the qualification must belong to someone who did expressed interest to one of the business's active job postings
            //the job posting also requires this qualification
            const matchingJob = await prisma.job.findFirst({ 
                where: {
                    business_id: user.id,
                    status: "open",
                    position_id: qualification.position_id,
                    interests: {
                        some: {
                            user_id: qualification.user_id
                        }
                    }
                }
            });

            if (!matchingJob){throw new Error("Forbidden - qualification by someone who did not express interest / job posting does not require this qualification")};
        
        }                                                    

        const candidate = await prisma.account.findUnique({where:{id: qualification.user_id }});
        if (!isBusiness){
            return {
            id: qualification.qualification_id,
            document: qualification.document,
            note: qualification.note,
            position_type: {
                id:qualification.position_type.position_id,
                name:qualification.position_type.name,
                description:qualification.position_type.description},
            updatedAt: qualification.updatedAt,
            user: {
                id: candidate.id,
                first_name: candidate.first_name,
                last_name: candidate.last_name,
                role: candidate.role,
                avatar: candidate.avatar,
                resume: candidate.resume,
                biography: candidate.biography,
                email: candidate.email,
                phone_number: candidate.phone_number,
                postal_address: candidate.postal_address,
                birthday: candidate.birthday,
                activated: candidate.activated,
                suspended: candidate.suspended,
                createdAt: candidate.createdAt},
            status: qualification.status,
            };
        };

        return {
            id: qualification.qualification_id,
            document: qualification.document,
            note: qualification.note,
            position_type: {
                id:qualification.position_type.position_id,
                name:qualification.position_type.name,
                description:qualification.position_type.description},
            updatedAt: qualification.updatedAt,
            user:{
                id: candidate.id,
                first_name: candidate.first_name,
                last_name:candidate.last_name,
                role: candidate.role,
                avatar: candidate.avatar,
                resume: candidate.resume,
                biography: candidate.biography
            }
        };
    };

    static async update(currUser, qualificationId, status, note){
        const updateData = {};
        const currQual = await prisma.qualification.findUnique({where:{qualification_id: qualificationId}});
        if (!currQual) {
            throw new Error("Not Found - qualification does not exist");
        }

        if (currUser.role === "regular" && currQual.user_id !== currUser.userId) {
            throw new Error("Forbidden");
        }

        if (currUser.role === "administrator") {
            if (status !== undefined) {  // validate if status is being changed
            const validAdminTransitions =
                (currQual.status === "submitted" || currQual.status === "revised") &&
                (status === "approved" || status === "rejected");
            if (!validAdminTransitions) {
                throw new Error("Forbidden");
            }
        }}
    
        if (currUser.role === "regular") {
            if (status !== undefined) {
            const validUserTransitions =
                (currQual.status === "created" && status === "submitted") ||
                (currQual.status === "rejected" && status === "revised") ||
                (currQual.status === "approved" && status === "revised");
            if (!validUserTransitions) {
                throw new Error("Forbidden - invalid status change by regular user");
            }
        }}

        if (status){updateData.status = status;};
        if (note){updateData.note = note;};
        updateData.updatedAt = new Date();

        const res = await prisma.$transaction(async (tx) => {
        const updatedQual = await tx.qualification.update({
            where: { qualification_id: parseInt(qualificationId) },
            data: updateData,
            include: {
                reg_user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                position_type: {
                    select: {
                        position_id: true,
                        name: true
                    }
                }
            }
        });

        if (status === "approved" && currQual.status !== "approved") {
            await tx.positionType.update({
                where: { position_id: currQual.position_id },
                data: {
                    num_qualified: { increment: 1 }
                }
            });
        }

        if (currQual.status === "approved" && status !== "approved") {
            await tx.positionType.update({
                where: { position_id: currQual.position_id },
                data: {
                    num_qualified: { decrement: 1 }
                }
            });
        }

        return updatedQual;
        });

        
        return {
            id: res.qualification_id,
            status: res.status,
            document:res.document,
            note: res.note,
            user: res.user,
            position_type: res.position_type,
            updatedAt: res.updatedAt
        };

    };

    static async updateDocument(qualificationId, document) {
        const qual = await prisma.qualification.findUnique({where: {qualification_id:qualificationId}});
        if (!qual){throw new Error("Qualification Not Found")}

        if (!document.toLowerCase().includes("pdf")) {
            throw new Error("Bad Request");
        }   

        return prisma.qualification.update({
            where: { qualification_id: qualificationId },
            data: { document }
        });
    }


    static async findApprovedQualifications(userId, findOne){
        if (findOne) {
            return prisma.qualification.findFirst({
                where: {
                    user_id: userId,
                    status: "approved"
                }
            });
        }
    }

    static async getOneForDoc(qualificationId, user){
        const qualification = await prisma.qualification.findUnique({
            where:{qualification_id: qualificationId}, include: {
            position_type: true,
            reg_user: true}});

        if (!qualification){
            throw new Error("Not Found - qualification not found");
        }    

        if (user.role === "regular" && qualification.user_id !== user.userId){
            throw new Error("Forbidden - user trying to upload doc for another persons qualification");
        }

        const candidate = await prisma.account.findUnique({where:{id: qualification.user_id }});
            return {
            id: qualification.qualification_id,
            document: qualification.document,
            note: qualification.note,
            position_type: {
                id:qualification.position_type.position_id,
                name:qualification.position_type.name,
                description:qualification.position_type.description},
            updatedAt: qualification.updatedAt,
            user: {
                id: candidate.id,
                first_name: candidate.first_name,
                last_name: candidate.last_name,
                role: candidate.role,
                avatar: candidate.avatar,
                resume: candidate.resume,
                biography: candidate.biography,
                email: candidate.email,
                phone_number: candidate.phone_number,
                postal_address: candidate.postal_address,
                birthday: candidate.birthday,
                activated: candidate.activated,
                suspended: candidate.suspended,
                createdAt: candidate.createdAt},
            status: qualification.status,
        };

    
    };

};

module.exports = { QualificationService };