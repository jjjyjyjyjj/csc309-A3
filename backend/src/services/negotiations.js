const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {getSystemConfig} = require("../config/system");
const { getIO } = require('../io');

class NegoService {
    static async create(user, interest_id){
        
        // first check if the interest exists and that the business/user is actually part of it
        const targetInterest = await prisma.interest.findUnique({
            where: {
                interest_id: interest_id
            },
            include: {
                job: {
                    include: {
                        business: true
                    }
                },
                user: true
            }
        });

        if (!targetInterest) {
            throw new Error("Not Found");
        }

        const regUser = targetInterest.user;
        const business = targetInterest.job.business;
        const job = targetInterest.job;

        if (user.userId !== regUser.id && user.userId !== business.id ){
            throw new Error("Not Found");
        }

        if (!targetInterest.business_interest || !targetInterest.user_interest || targetInterest.business_interest == null || targetInterest.user_interest == null){
            throw new Error("Forbidden");
        } 
        
        // add same error for users that aren't discoverable
        // COULD USE THESE FOR OTHER FUNCTIONS THAT NEED TO CHECK DISCOVERABILIY
            // Their account is activated.
            // Their account is not suspended.
            // They are qualified for the job posting.
            // Their availability status is set to available.
            // They have been active within a system-defined inactivity window
            // They are not committed to another job whose working hours conflict with this job.

        
        // check if user is qualified
        // const qualification = await prisma.qualification.findUnique({
        //     where: {
        //         position_id_user_id: {
        //             position_id: job.position_id,
        //             user_id: regUser.id
        //         }
        //     }
        // });

        // if (!qualification) {
        //     throw new Error("Forbidden");
        // }

        // // activated, suspended, available, inactive
        // const config = getSystemConfig();

        // if (!regUser.activated || regUser.suspended || !regUser.available || (new Date() - regUser.last_active) > config.availability_timeout * 1000) {
        //     throw new Error("Forbidden");
        // }

        // checking to see if a negotiation already exists for this interest_id
        let existingNegotiation = await prisma.negotiation.findUnique({
            where: { interest_id },
            include: {
                job: {
                    include: {
                        position_type: true,
                        business: true
                    }
                },
                user: true,
            }
        });

        if (existingNegotiation) {
            const formattedNegotiation = {
                id: existingNegotiation.negotiation_id,
                status: existingNegotiation.status,
                createdAt: existingNegotiation.createdAt,
                updatedAt: existingNegotiation.updatedAt,
                expiresAt: existingNegotiation.expiresAt,
                job: {
                    id: existingNegotiation.job.job_id,
                    status: existingNegotiation.job.status,
                    position_type: { 
                        id: existingNegotiation.job.position_type.position_id, 
                        name: existingNegotiation.job.position_type.name 
                    },
                    business: { 
                        id:existingNegotiation.job.business.id, 
                        business_name: existingNegotiation.job.business.business_name 
                    },
                    salary_min: existingNegotiation.job.salary_min,
                    salary_max: existingNegotiation.job.salary_max,
                    start_time: existingNegotiation.job.start_time,
                    end_time: existingNegotiation.job.end_time
                },
                user: {
                    id: existingNegotiation.user.id,
                    first_name: existingNegotiation.user.first_name,
                    last_name: existingNegotiation.user.last_name
                },
                decisions: { 
                    candidate: existingNegotiation.candidate_decision, 
                    business: existingNegotiation.business_decision
                }
            };
        
            return { negotiation: formattedNegotiation, created: false }
        };

        const otherActiveNegotiation = await prisma.negotiation.findFirst({
            where: {
                OR: [{ user_id: regUser.id }, { business_id: business.id }],
                status: "active",
                NOT: { interest_id: interest_id } 
            }
        });

        if (otherActiveNegotiation) {
            throw new Error("Conflict");
        }

        if (job.status !== "open") {
            throw new Error("Conflict");
        }

        // Check if user is qualified
        const qualification = await prisma.qualification.findUnique({
            where: {
                position_id_user_id: {
                    position_id: job.position_id,
                    user_id: regUser.id
                }
            }
        });

        if (!qualification || qualification.status !== "approved") {
            throw new Error("Forbidden");
        }

        // Check discoverability
        const config = getSystemConfig();

        if (!regUser.activated || regUser.suspended || !regUser.available ||
            (new Date() - regUser.last_active) > config.availability_timeout * 1000) {
            throw new Error("Forbidden");
        }

        // check if they already accepted another job whose working hours conflict with this job
        const job_check = await prisma.job.findFirst({
            where: {
                regularuser_id: regUser.id,
                status: "filled",
                OR: [
                    { start_time: { gte: job.start_time, lt: job.end_time } },  // existing start is within new job
                    { end_time: { gt: job.start_time, lte: job.end_time } },    // existing end is within new job
                    { start_time: { lte: job.start_time }, end_time: { gte: job.end_time } }, // existing job completely wraps new job
                ]
            }
        });

        if (job_check) { // they have overlapping 
            throw new Error("Forbidden");
        }

        const negotiation = await prisma.negotiation.create({
            data :{
                interest_id: interest_id,
                user_id: regUser.id,          
                business_id: business.id,   
                job_id: job.job_id,
                expiresAt: new Date(Date.now() + config.negotiation_window * 1000),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                business: {
                    select: {
                        id: true,
                        business_name: true
                    }
                },
                job: {
                     select: { 
                        job_id: true,
                        status: true,
                        salary_min: true,
                        salary_max: true,
                        start_time: true,
                        end_time: true,
                        position_type: {
                            select: {
                                position_id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });    

        const formattedNegotiation = {
            id: negotiation.negotiation_id,
            status: negotiation.status,
            createdAt: negotiation.createdAt,
            updatedAt: negotiation.updatedAt,
            expiresAt: negotiation.expiresAt,
            job: {
                id: negotiation.job.job_id,
                status: negotiation.job.status,
                position_type: {
                    id: negotiation.job.position_type.position_id,
                    name: negotiation.job.position_type.name
                },
                business: {  
                    id: negotiation.business.id,
                    business_name: negotiation.business.business_name
                },
                salary_min: negotiation.job.salary_min,
                salary_max: negotiation.job.salary_max,
                start_time: negotiation.job.start_time,
                end_time: negotiation.job.end_time
            },
            user: {
                id: negotiation.user.id,
                first_name: negotiation.user.first_name,
                last_name: negotiation.user.last_name
            },
            decisions: {
                candidate: negotiation.candidate_decision,
                business: negotiation.business_decision
            }
        };

        const io = getIO();

        if (io) {
            // join both parties to the negotiation room
            const roomName = `negotiation:${negotiation.negotiation_id}`;
            const sockets = await io.fetchSockets();
            
            for (const s of sockets) {
                if (s.userId === negotiation.user.id || s.userId === negotiation.business.id) {
                    s.join(roomName);
                }
            }
        
            // notify both parties
            io.to(`account:${negotiation.user.id}`).emit("negotiation:started", { negotiation_id: negotiation.negotiation_id });
            io.to(`account:${negotiation.business.id}`).emit("negotiation:started", { negotiation_id: negotiation.negotiation_id });
        }

        return { negotiation: formattedNegotiation, created: true }
    };

    static async retrieve (userId, role){
        const where = role === 'business' ? { business_id: userId, status: 'active' } : { user_id: userId, status: 'active' };
        const negotiation = await prisma.negotiation.findFirst({
                where,
                include:{
                    job: {
                    include: {
                        position_type: true,
                        business: true
                    }
                },
                user: true,
                business:true
            }
        });

        if (!negotiation) {return null;};

        const res = {
            id: negotiation.negotiation_id,
            status: negotiation.status,
            createdAt: negotiation.createdAt,
            updatedAt: negotiation.updatedAt,
            expiresAt: negotiation.expiresAt,
            job: {
                id: negotiation.job.job_id,
                status: negotiation.job.status,
                position_type: {
                    id: negotiation.job.position_type.position_id,
                    name: negotiation.job.position_type.name
                },
                business: {  
                    id: negotiation.business.id,
                    business_name: negotiation.business.business_name
                },
                salary_min: negotiation.job.salary_min,
                salary_max: negotiation.job.salary_max,
                start_time: negotiation.job.start_time,
                end_time: negotiation.job.end_time
            },
            user: {
                id: negotiation.user.id,
                first_name: negotiation.user.first_name,
                last_name: negotiation.user.last_name
            },
            decisions: {
                candidate: negotiation.candidate_decision,
                business: negotiation.business_decision
            }
        };

        return res;
    };

    static async decide (user, decision, negotiation_id){
        const activeNegotiation = await prisma.negotiation.findUnique({
            where:{ negotiation_id},
            include: {
                interest:true,
                user: true,
                business: true,
                job: true
            }});
            
        if (!activeNegotiation){
            throw new Error("Not Found - negotiation does not exist");
        }

        if (activeNegotiation.status !== "active") {
            throw new Error("Conflict - negotiation is not active");
        }

        if (activeNegotiation.negotiation_id !== negotiation_id) {
            throw new Error("Conflict - negotiation ID does not match the active negotiation");
        }

        //decision already made
        if (user.role === "regular" && activeNegotiation.candidate_decision !== null) {
            throw new Error("Conflict - decision made already");
        }

        if (user.role === "business" && activeNegotiation.business_decision !== null) {
            throw new Error("Conflict - decision made already");
        }

        let data = {};
        if (user.role === "regular"){data.candidate_decision=decision}
        else if (user.role ==="business"){data.business_decision=decision};

        let negotiation = await prisma.negotiation.update({
            where:{negotiation_id: negotiation_id}, 
            data});

        const candidate_decision = negotiation.candidate_decision;
        const business_decision = negotiation.business_decision;

        let finalStatus = "active";
        
        if (candidate_decision==="accept" && business_decision==="accept") {
                await prisma.$transaction([
                prisma.negotiation.update({
                    where: { negotiation_id: negotiation_id },
                    data: { status: "success" }
                }),
                prisma.job.update({
                    where: { job_id: negotiation.job_id },
                    data: { 
                        status: "filled",
                        regularuser_id: negotiation.user_id
                    }
                }),
                prisma.account.update({
                    where: { id: negotiation.user_id },
                    data: { last_active: new Date() }
                })
            ]);
        

        finalStatus = "success";
        const io = getIO();
        if (io) {
            io.to(`negotiation:${negotiation.negotiation_id}`).emit("negotiation:ended", {
                negotiation_id: negotiation.negotiation_id,
                status: "success"
            });
        }}
        else if (candidate_decision === "decline" || business_decision === "decline") {
            await prisma.$transaction([
                prisma.negotiation.update({
                    where: { negotiation_id: negotiation_id },
                    data: { status: "failed" }
                }),
                prisma.interest.update({
                    where: { interest_id: negotiation.interest_id },
                    data: {
                        user_interest: null,
                        business_interest: null
                    }
                }),
                prisma.account.update({
                    where: { id: negotiation.user_id },
                    data: { last_active: new Date() }
                })
            ]);

            finalStatus = "failed";
            const io = getIO();
            if (io) {
                io.to(`negotiation:${negotiation.negotiation_id}`).emit("negotiation:ended", {
                    negotiation_id: negotiation.negotiation_id,
                    status: "failed"
                });
            }
        }

        return {
            id: negotiation.negotiation_id,
            status: finalStatus,
            createdAt: negotiation.createdAt,
            expiresAt: negotiation.expiresAt,
            updatedAt: new Date(),
            decisions: {
                candidate: negotiation.candidate_decision, 
                business: negotiation.business_decision}
        }
    };
}

module.exports = {NegoService};