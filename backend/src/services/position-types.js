const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class PositionService {
    static async create(name, description, hidden) {
        console.log("position create service called");
        if (name === undefined || description === undefined){
            throw new Error("Name or description is undefined");
        }
        const createdPosition = await prisma.positionType.create({
            data: {
                name: name,
                description: description,
                hidden: hidden !== undefined ? hidden : true,
            }
        });
        console.log("createdPosition: " + createdPosition);
        return {
            id: createdPosition.position_id,
            name:createdPosition.name,
            description:createdPosition.description,
            hidden:createdPosition.hidden,
            num_qualified:createdPosition.num_qualified
        };
    }

    static async getAll(isAdmin, keyword, name, hidden, num_qualified, page, limit) {
        const validSort = ["asc", "desc"];
        if ((name && !validSort.includes(name))|| (num_qualified && !validSort.includes(num_qualified))){
            throw new Error("Bad Request");
        }
        const sortOrderName = name || "asc";
        const sortNumQual = num_qualified || "asc"; //only admin can sort w this
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        const where = {};
        if (!isAdmin){
            where.hidden = false;
        } else if (hidden !== undefined){
            where.hidden = hidden === 'true' || hidden === true;
        }

        if (keyword) {
            where.OR = [ { name: { contains: keyword } },
            { description: { contains: keyword} }
            ]
        };
        
        const orderBy = [];
        if (isAdmin) {
            orderBy.push({ num_qualified: sortNumQual });  
        }
        orderBy.push({ name: sortOrderName });

         const [positionTypes, total] = await Promise.all([
            prisma.positionType.findMany({
                where: where,
                orderBy: orderBy,
                skip: (pageNum - 1) * limitNum,
                take: limitNum
            }),
            prisma.positionType.count({ where: where })
        ]);

        if (isAdmin){
            return {count: total,
                    results: positionTypes.map(type=>{return{
                        id: type.position_id,
                        name: type.name,
                        description:type.description,
                        hidden: type.hidden,
                        num_qualified:type.num_qualified
                    }
                })
            }
        }
        
        return {count: total,
                    results: positionTypes.map(type=>{return{
                        id: type.position_id,
                        name: type.name,
                        description:type.description}})};
    }

    static async edit(positionId, name, description, hidden) {
        const updateData = {...(name !== undefined && {name}),
                            ...(description !== undefined && {description}),
                            ...(hidden !== undefined && {hidden})};
        let updated;
        try{
            updated = await prisma.positionType.update({where:{position_id: positionId}, data: updateData});}
        catch(error){throw new Error("Not Found - positiontypeid does not exist")};

        const res = {id: updated.position_id,
                     ...(name !== undefined && {name: updated.name}),
                     ...(description !== undefined && {description: updated.description}),
                     ...(hidden !== undefined && {hidden: updated.hidden})};

        return res;
    }

    static async delete(positionId){
        const targetPosition = await prisma.positionType.findUnique({where: {position_id: positionId}});
        if (!targetPosition){throw new Error("Not Found");}

        if (targetPosition.num_qualified > 0){
            throw new Error("Conflict");
        }
       return await prisma.positionType.delete({where: {position_id: positionId}});
    }

    static async get(where) {
        const targetPosition = await prisma.positionType.findUnique({where});

        if (targetPosition === null){
            throw new Error(`Position with position id ${where.position_id} should exist`);
        }

        return targetPosition;
    }
}

module.exports = { PositionService };