const { PositionService } = require("../services/position-types");

const createPositionController = async (req, res) => {
    const { name, description, hidden } = req.body;
    try{
        const createdPosition = await PositionService.create(name, description, hidden);
        return res.status(201).json(createdPosition);
    } catch (error){
        return res.status(400).json({error: error.message});
        // if (error.message.includes("Bad Request")){
        //     return res.status(400).json({error: error.message});
        // }
    }
   
};

const getAllPositionsController = async (req, res) => {
    const {keyword, name, hidden, num_qualified, page, limit} = req.query;
    const isAdmin = req.user && req.user.role === "administrator";

    try{
        const data = await PositionService.getAll(isAdmin, keyword, name, hidden, num_qualified, page, limit);
        return res.status(200).json(data);
    } catch (error){
        if (error.message.includes("Bad Request")){
            return res.status(400).json({error: error.message});
        }
    }
    
};

const editPositionController = async (req,res) => {
    const {positionTypeId} = req.params;
    const {name, description, hidden} = req.body;
    try{
        const updatedField = await PositionService.edit(parseInt(positionTypeId), name, description, hidden);
        return res.status(200).json(updatedField);
    } catch(error){
         if (error.message.includes("Not Found")){
            return res.status(404).json({error: error.message});
        }}
}
    
const deletePositionController = async (req, res) =>{
    const {positionTypeId} = req.params;
    try{
        const deleted = await PositionService.delete(parseInt(positionTypeId));
        return res.status(204).json(deleted);
    } catch (error){
        if (error.message.includes("Not Found")){return res.status(404).json({error: error.message})}
        if (error.message.includes("Conflict")){return res.status(409).json({error: error.message})};
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { createPositionController, getAllPositionsController, editPositionController, deletePositionController };