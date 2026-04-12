const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BusinessService {
    static async create(data) {
        return prisma.account.create({
            data
        });
    }

    // retrieve a business based on email through account model
    static async retrieveAccount(data) {
        return prisma.account.findUnique({
            where: data
        });
    }

    static async findMany(where, orderBy, take, skip) {
        return prisma.account.findMany({
            where, orderBy, take, skip
        });
    }

    static async count(where) {
        return prisma.account.count({ where });
    }

    static async verify(businessId, verified){
        const verifiedBusiness = await prisma.account.update({where:{id: businessId}, data:{verified: verified}});

        return {id: verifiedBusiness.id,
                business_name: verifiedBusiness.business_name,
                owner_name: verifiedBusiness.owner_name,
                email: verifiedBusiness.email,
                activated: verifiedBusiness.activated,
                verified: verifiedBusiness.verified,
                role: verifiedBusiness.role,
                phone_number: verifiedBusiness.phone_number,
                postal_address: verifiedBusiness.postal_address
            }
    }

    static async update(where, data, includeJob = false) {
        return prisma.account.update({
            where,
            data,
            include: includeJob ? {
                job_postings: {
                    orderBy: { createdAt: "desc" },
                    take: 1  // most recent created job
                }
            } : undefined
        });
    }
}

module.exports = { BusinessService }