const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class JobService{
    

    static async createJob(data) {
        return prisma.job.create({
            data,
            include: {
                business: {
                    select: {
                        id: true,
                        business_name: true
                    }
                },
                position_type: {
                    select: {
                        position_id: true,
                        name: true
                    }
                },
                worker: {
                    select: {
                        id: true
                    }
                }
            }
        });
    }

    static async getJobsForBusiness(where, take, skip) {
        const [count, jobs] = await Promise.all([
        prisma.job.count({where}),
        prisma.job.findMany({
            where,
            include: {
                business: {select: {id: true, business_name: true}},
                position_type: {select: {position_id: true, name: true}},
                worker: {select: {id: true, first_name: true, last_name: true}}
            },
            take,
            skip
        })]);

        return {count, jobs}
    }

    static async retrieveOne(where, includeNegotiation = false) {
        return prisma.job.findUnique({
            where,
            include: includeNegotiation ? {
                negotiations: {
                    where: {status: "active"},
                    take: 1
                }
            }
            : undefined
        });
    }

    static async updateJob(where, data) {
        return prisma.job.update({
            where,
            data
        });
    }

    static async deleteJob(where) {
        return prisma.job.delete({
            where
        });
    }

    static async getAllJobs(lat, lon, position_type_id, business_id, sort, order, page, limit) {
        const filter = { status: "open" };
        
        if (position_type_id) {
            const parsed_positionId = parseInt(position_type_id);
            if (isNaN(parsed_positionId)) {
                throw new Error("Bad Request - position_type_id must be a number");
            }
            filter.position_id = parsed_positionId;
        }
        
        if (business_id) {
            const parsed_business_id = parseInt(business_id);
            if (isNaN(parsed_business_id)) {
                throw new Error("Bad Request - business_id must be a number");
            }
            filter.business_id = parsed_business_id;
        }

        const validSortFields = ["updatedAt", "start_time", "salary_min", "salary_max", "distance", "eta"];
        const validOrders = ["asc", "desc"];
        
        const sortField = sort || "start_time";
        const sortOrder = order || "asc";
        
        if (!validSortFields.includes(sortField)) {
            throw new Error("Bad Request - Invalid sort field");
        }
        
        if (!validOrders.includes(sortOrder)) {
            throw new Error("Bad Request - Invalid sort order");
        }

        if ((sortField === "distance" || sortField === "eta") && (!lat || !lon)) {
            throw new Error("Bad Request - lat and lon required for distance/eta sorting");
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        const needsDistanceSorting = (sortField === "distance" || sortField === "eta");

        let orderBy = {};
        let skip, take;

        if (needsDistanceSorting) {
            orderBy.start_time = "asc"; 
            skip = undefined;
            take = undefined;
        } else {
            orderBy[sortField] = sortOrder;
            skip = (pageNum - 1) * limitNum;
            take = limitNum;
        }

        const [filteredJobs, totalCount] = await Promise.all([
            prisma.job.findMany({
                where: filter,
                include: {
                    position_type: {
                        select: {
                            position_id: true,
                            name: true
                        }
                    },
                    business: {
                        select: {
                            id: true,
                            business_name: true,
                            location_lat: true,
                            location_lon: true
                        }
                    }
                },
                orderBy: orderBy,
                skip: skip,
                take: take
            }),
            prisma.job.count({ where: filter }) 
        ]);

        let jobs = filteredJobs.map(job => {
            const baseJob = {
                id: job.job_id,
                status: job.status,
                position_type: {
                    id: job.position_type.position_id,
                    name: job.position_type.name
                },
                business: {
                    id: job.business.id,
                    business_name: job.business.business_name
                },
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                start_time: job.start_time,
                end_time: job.end_time,
                updatedAt: job.updatedAt
            };

            if (lat && lon) {
                const parsed_lat = parseFloat(lat);
                const parsed_lon = parseFloat(lon);
                
                if (isNaN(parsed_lat) || isNaN(parsed_lon)) {
                    throw new Error("Bad Request - lat and lon must be numbers");
                }

                const dist = JobService.calculateDistance(
                    parsed_lat,
                    parsed_lon,
                    job.business.location_lat,
                    job.business.location_lon
                );
                const etaValue = JobService.calculateETA(dist);

                baseJob.distance = dist;
                baseJob.eta = etaValue;
            }

            return baseJob;
        });

        if (needsDistanceSorting) {
            jobs.sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];
                return sortOrder === "asc" ? valA - valB : valB - valA;
            });

            const paginateSkip = (pageNum - 1) * limitNum;
            jobs = jobs.slice(paginateSkip, paginateSkip + limitNum);
        }

        return {
            count: totalCount,
            results: jobs
        };
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371.2;
        const toRadians = (deg) => deg * (Math.PI / 180);
        
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance * 10) / 10;
    }

    static calculateETA(distanceKm) {
        const avgSpeed = 30;
        return Math.round((distanceKm / avgSpeed) * 60);
    }

    static async getJobDetails(jobId, userId, role, lat, lon){
        if (role === 'business' && (lat !== undefined || lon !== undefined)) {
            throw new Error("Bad Request - business users cannot specify lat or lon");
        }
        const job = await prisma.job.findUnique({
            where: {job_id:jobId},
            include: {
                position_type: {
                    select: {
                        position_id: true,
                        name: true
                    }
                },
                business: {
                    select: {
                        id: true,
                        business_name: true,
                        location_lat: true,
                        location_lon: true
                    }
                },
                worker: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });

        if (!job){
            throw new Error("Not Found");
        }

        // if user is a business, they can only see jobs they posted
        if (role ==="business" && job.business_id !== userId){
            throw new Error("Not Found");
        };

        // regular user can only view open jobs or jobs that they've filled,completed or canceled
        const allowedStatus = ["open", "canceled",  "completed", "filled"];
        if (role === "regular"){ 
            if (!allowedStatus.includes(job.status)){
                throw new Error("Not Found");
            };
        }

        if (role === "regular" && job.status === "open") {
            const qualification = await prisma.qualification.findFirst({
                where: {
                    user_id: userId,
                    position_id: job.position_id,
                    status: "approved"
                }
            });

            if (!qualification) {
                throw new Error("Forbidden - user not qualified for this job");
            }
        }

        let res = {
            id: job.job_id,
            status: job.status,
            position_type: {
                id: job.position_type.position_id,
                name: job.position_type.name
            },
            business: {
                id: job.business.id,
                business_name: job.business.business_name
            },
            worker: job.worker ? {
                id: job.worker.id,
                first_name: job.worker.first_name,
                last_name: job.worker.last_name
            } : null,
            note: job.note || "",
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            start_time: job.start_time,
            end_time: job.end_time,
            updatedAt: job.updatedAt
        };

        if (lat !== undefined && lon !== undefined) {
            const parsed_lat = parseFloat(lat);
            const parsed_lon = parseFloat(lon);

            if (isNaN(parsed_lat) || isNaN(parsed_lon)) {
                throw new Error("Bad Request - lat and lon must be numbers");
            }

            const distance = JobService.calculateDistance(
                parsed_lat,
                parsed_lon,
                job.business.location_lat,
                job.business.location_lon
            );
            const eta = JobService.calculateETA(distance);

            res.distance = distance;
            res.eta = eta;
        }

        return res;
    };

    static async cancel(jobId){
        const parsedJobId = parseInt(jobId);
        if (isNaN(parsedJobId)) {
            throw new Error("Bad Request - Invalid job ID");
        }

        const job = await prisma.job.findUnique({where:{job_id:parsedJobId}, include:{worker:true}});
        if (!job) {
            throw new Error("Not Found - Job does not exist");
        }
        if (job.status !== "filled") {
            throw new Error("Conflict - Job must be filled to report no-show");
        }

        const now = new Date();
        if (job.start_time > now) {
            throw new Error("Conflict - Job has not started yet");
        }

        if (job.end_time <= now) {
            throw new Error("Conflict - Job has already ended");
        }

        if (!job.worker) {
            throw new Error("Conflict - No worker assigned to this job");
        }
        const [updatedJob] = await prisma.$transaction([
            prisma.job.update({
                where: { job_id: parsedJobId },
                data: {
                    status: "canceled",
                    updatedAt: now
                }
            }),
            prisma.account.update({
                where: { id: job.regularuser_id },  
                data: { suspended: true }
            })
        ]);

        return {
            id: updatedJob.job_id,
            status: updatedJob.status,
            updatedAt: updatedJob.updatedAt};
    };
    
    static async expressInterest(jobId, userId, interested){
        //user has not expressed interest
        const job = await prisma.job.findUnique({where: {job_id: jobId}, include: { business: true }});
        if (!job){throw new Error("Not Found")};

        const now = new Date();
        if (job.status !== "open" || new Date(job.start_time) < now){throw new Error("Conflict")};
        // const isNotOpen = job.status.toLowerCase() !== "open";
        // const isExpired = (job.end_time <= now);
        // if ( isNotOpen|| isExpired ){throw new Error("Conflict")};

        // const qualification = await prisma.qualification.findUnique({
        //     where:{
        //         position_id_user_id:{
        //             position_id:job.position_id,
        //             user_id: userId
        //         }
        //     }
        // });

        // if (!qualification || qualification.status !== "approved"){
        //     throw new Error("Forbidden - user not qualified for this")
        // }

        const existingNegotiation = await prisma.negotiation.findFirst({
            where:{
                job_id: jobId,
                user_id: userId,
                status: "active"
            }});

        if (existingNegotiation){
            throw new Error("Conflict - user in negotiation for this job");
        }

        const existingInterest = await prisma.interest.findUnique({
            where: { 
                job_id_user_id: { job_id: jobId, user_id: userId }
            }
        });

        let updatedInterest;
        // express not interested
        if (interested=== false){
            if (!existingInterest) {throw new Error("Bad Request - no interest to withdraw")};
            updatedInterest = await prisma.interest.update({
                where: { interest_id: existingInterest.interest_id },
                data: { user_interest: false }
            });
        } else {
                if (existingInterest) {
                    updatedInterest = await prisma.interest.update({
                        where: { interest_id: existingInterest.interest_id },
                        data: { user_interest: true }
                    });
                } else {
                    updatedInterest = await prisma.interest.create({
                        data: {
                            job_id: jobId,
                            user_id: userId,
                            user_interest: true,
                            business_interest: null
                        }
                    });
                }}

        await prisma.account.update({
            where: { id: userId },
            data: { last_active: new Date() }
        });

        return {
            id: updatedInterest.interest_id,
            job_id: updatedInterest.job_id,
            candidate: {
                id: updatedInterest.user_id,
                interested: updatedInterest.user_interest
            },
            business: {
                id: job.business_id,
                interested: updatedInterest.business_interest
            }
        };
    };

    static async getAllQualified(businessId, jobId, page, limit){ 
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        const job = await prisma.job.findUnique({where:{job_id:jobId}});
        const interest = await prisma.interest.findMany({where:{job_id:jobId}});

        if(!job){throw new Error("Not Found -  job posting does not exist");}
        if (job.business_id!= businessId){
            throw new Error("Not Found -  job posting does not belong to the authenticated business");
        }

        const where = {
            position_id: job.position_id, 
            status: "approved"
        } ;

        const [qualified, num_qualified] = await Promise.all([
            prisma.qualification.findMany({
            where,
            include:{
                reg_user:{
                    select:{id: true, first_name:true, last_name: true,available: true,suspended: true,
                        assigned_jobs: {  // ✅ Include assigned jobs
                            where: {
                                status: "filled"
                            },
                            select: {
                                start_time: true,
                                end_time: true
                            }
                        }
                    }}},
            skip: (pageNum-1)* limitNum, 
            take:limitNum}),

            prisma.qualification.count({where})]);

        const interests = await prisma.interest.findMany({
            where: { job_id: jobId },
            select: {
                user_id: true,
                business_interest: true
            }
        }); 

        const inviteMap = new Map();
        interests.forEach(interest => {
            inviteMap.set(interest.user_id, interest.business_interest === true);
        });

        const hasTimeConflict = (userJobs, jobStart, jobEnd) => {
            return userJobs.some(existingJob => {
                const existingStart = new Date(existingJob.start_time);
                const existingEnd = new Date(existingJob.end_time);
                const newStart = new Date(jobStart);
                const newEnd = new Date(jobEnd);

                // check if time ranges overlap
                return (newStart < existingEnd && newEnd > existingStart);
            });
        };

        const results = qualified.filter(qual => {
                const user = qual.reg_user;
                
                // user is available and not suspended
                if (!user.available || user.suspended) {
                    return false;
                }

                // no conflicting job commitments
                if (hasTimeConflict(user.assigned_jobs, job.start_time, job.end_time)) {
                    return false;
                }

                return true;
            })
            .map(qual => ({
                id: qual.reg_user.id,
                first_name: qual.reg_user.first_name,
                last_name: qual.reg_user.last_name,
                invited: inviteMap.get(qual.reg_user.id) || false
            }));

        return {
            count: num_qualified,
            results
            };
    };

    static async getOneQualified(businessId, jobId,userId){
        const user = await prisma.account.findUnique({where:{id:userId}});
        const business = await prisma.account.findUnique({where:{id:businessId}});
        const job = await prisma.job.findUnique({where:{job_id:jobId}, include:{position_type: true}});

        if(!job || !user){throw new Error("Not Found -  job posting / user does not exist");}
        if (job.business_id != business.id){
            throw new Error("Not Found -  job posting does not belong to the authenticated business");
        }

        const qualification = await prisma.qualification.findUnique({
            where:{position_id_user_id:{
                position_id: job.position_id,
                user_id: user.id
            }}});
        if (!qualification) { throw new Error("Not Found - qualification not found");}    

        const res = {
            user:{
                id:user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar: user.avatar,
                resume: user.resume,
                biography: user.biography,
                qualification: { 
                    id: qualification.qualification_id,
                    position_type_id: qualification.position_id,
                    document: qualification.document,
                    note: qualification.note,
                    updatedAt: qualification.updatedAt
                }
            },
            job:{
                id: job.job_id,
                status: job.status,
                position_type: {
                    id: job.position_type.position_id,
                    name: job.position_type.name,
                    description: job.position_type.description
                },
                start_time: job.start_time,
                end_time: job.end_time
            }
        };

        if (job.status === "filled"){
            res.user.email = user.email;
            res.user.phone_number = user.phone_number;
        }

        return res;
        
    };

    static async sentInvite(businessId, jobId,userId, interest){
        const [user, job] = await Promise.all([
            prisma.account.findUnique({ where: { id: userId } }),
            prisma.job.findUnique({ where: { job_id: jobId } })
        ]);

        if (!job) {
            throw new Error("Not Found - job posting does not exist");
        }

        if (!user) {
            throw new Error("Not Found - user does not exist");
        }

        if (job.business_id !== businessId) {
            throw new Error("Not Found - job posting does not belong to the authenticated business");
        }

        if (job.status !== "open") {
            throw new Error("Conflict - job is not open");
        }

        const qualification = await prisma.qualification.findFirst({
            where: {
                user_id: userId,
                position_id: job.position_id,
                status: "approved"
            }
        });

        if (!qualification) {
            throw new Error("Forbidden - User is not qualified for this job");
        }

        if (user.suspended || !user.available) {
            throw new Error("Forbidden - User is no longer discoverable");
        }

        let interestRecord = await prisma.interest.findUnique({
            where: {
                job_id_user_id: {
                    job_id: jobId,
                    user_id: userId
                }
            }
        });

        if (!interestRecord) {
            interestRecord = await prisma.interest.create({
                data: {
                    job_id: jobId,
                    user_id: userId,
                    user_interest: null,
                    business_interest: interest
                }
            });
        } else {
            if (interestRecord.business_interest !== true && interest === false) {
                throw new Error("Bad Request -  business has not previously invited user");
            }

            interestRecord = await prisma.interest.update({
                where: { interest_id: interestRecord.interest_id },
                data: { business_interest: interest }
            });
        }

        return {
            id: interestRecord.interest_id,
            job_id: interestRecord.job_id,
            candidate: {
                id: interestRecord.user_id,
                interested: interestRecord.user_interest
            },
            business: {
                id: businessId,
                interested: interestRecord.business_interest
            }
        };
    };

    static async getInterested(businessId, jobId, page, limit){
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        
        const job = await prisma.job.findUnique({where:{job_id:jobId}});

        if(!job){throw new Error("Not Found -  job posting does not exist");}
        if (job.business_id!= businessId){
            throw new Error("Not Found -  job posting does not belong to the authenticated business");
        }

        const interests = await prisma.interest.findMany({
            where:{job_id:jobId},
            include:{
                user: true
            },
            skip:(pageNum-1)* limitNum,
            take: limitNum});
        
        const count = await prisma.interest.count({where: { job_id: jobId }});    
        
        const results = interests.map(interest =>({
            interest_id: interest.interest_id,
            mutual: (interest.user_interest === interest.business_interest),
            user: {
                id: interest.user.id,
                first_name: interest.user.first_name,
                last_name: interest.user.last_name
            }
        }));
        
        return {count:count, results:results}
    };

};


module.exports = {JobService};