const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserService {
    static async create(data) {
        return prisma.account.create({
            data: data
        });
    }

    static async retrieve(data) {
        return prisma.account.findUnique({
            where: data, 
            include:{qualifications:{include:{ position_type: true } } } 
        });
    }

    static async update(where, data) {
        const select = {id:true};
        Object.keys(data).forEach(key => {
            select[key] = true;
        });
        
        const updated = await prisma.account.update({
            where,
            data,
            select
        });

        return updated;
    }

    static async findMany(keyword, activated, suspended, last_name, email, page, limit) {
        const validSort = ["asc","desc"];
        if ((last_name && !validSort.includes(last_name)) || (email && !validSort.includes(email))){throw new Error("Bad Request")}
        const last_name_sort = last_name ? last_name : "asc";
        const email_sort = email? email : "asc";
        
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        const where = {...(keyword && { 
            OR: [ { first_name: { contains: keyword,  mode: "insensitive" } },
                 { last_name: { contains: keyword,  mode: "insensitive" } },
                 { email: { contains: keyword, mode: "insensitive"  } },
                {postal_address:{contains:keyword, mode: "insensitive" }}, 
                {phone_number: {contains: keyword, mode: "insensitive" }}]}),
            ...(activated!== undefined && {activated:activated}), ...(suspended!== undefined && {suspended:suspended}), 
        role: "regular"};

        const [allUsers, totalUsers] = await Promise.all([
            prisma.account.findMany({
            where: where,
            orderBy: [{ last_name: last_name_sort }, { email: email_sort }],
            skip: (pageNum-1)*limitNum,
            take: limitNum
        }),
            prisma.account.count({where: where})
        ]);
        const mappedUsers= allUsers.map(user=>{
            return {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                activated: user.activated,
                suspended: user.suspended,
                role: user.role,
                phone_number: user.phone_number,
                postal_address: user.postal_address,
            };
        });
        
        return {count: totalUsers, results: mappedUsers};
    }

    static async suspend(userId, suspend){
        if (typeof suspend !== 'boolean') {
            throw new Error("Bad Request - suspended must be a boolean");
        }
        const user = await prisma.account.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user || user.role !== "regular") {
             throw new Error("Not Found");
        }

        const suspendedUser = await prisma.account.update({
            where: { id: parseInt(userId) },
            data: { suspended: suspend }
        });

        return {
            id: suspendedUser.id,
            first_name: suspendedUser.first_name,
            last_name: suspendedUser.last_name,
            email: suspendedUser.email,
            activated: suspendedUser.activated,
            suspended: suspendedUser.suspended,
            role: suspendedUser.role,
            phone_number: suspendedUser.phone_number,
            postal_address: suspendedUser.postal_address
        };
    };

    static async findInvitations(userId, skip, take) {
        const where = {
            interests: {
                some: {
                    user_id: userId,
                    business_interest: true,
                    OR: [
                        { user_interest: null },
                        { user_interest: false },
                    ],
                },
            },
        };
    
        // should only have one result for interests because @@unique([job_id, user_id]) in interest model
        const [jobs, count] = await prisma.$transaction([
            prisma.job.findMany({
                where,
                skip,
                take,
                include: {
                    interests: {
                        where: { user_id: userId },
                    },
                    position_type: true,
                    business: true,
                },
            }),
            prisma.job.count({ where }),
        ]);

        // const where = {
        //     user_id: userId,
        //     business_interest: true,
        //     OR: [
        //         { user_interest: null },
        //         { user_interest: false }
        //     ]
        // }

        // const [jobs, count] = await prisma.$transaction([
        //     prisma.interest.findMany({
        //         where, 
        //         skip,
        //         take,
        //         include: {
        //             job: {
        //                 include: {
        //                     position_type: true,
        //                     business: true
        //                 }
        //             }
        //         }
        //     }),
        //     prisma.interest.count({ where }),
        // ])
    
        return { jobs, count };
    }


    static async findInterests(userId, skip, take) {
        const where = {
            user_id: userId,
            user_interest: true
        };
    
        const [interests, count] = await prisma.$transaction([
            prisma.interest.findMany({
                where,
                skip,
                take,
                // orderBy: {
                //     interest_id: "asc"
                // },
                include: {
                    job: {
                        include: {
                            position_type: true,
                            business: true
                        }
                    }
                }
            }),
            prisma.interest.count({ where }),
        ]);
    
        return { interests, count };
    }
}

module.exports = { UserService };
