const { QualificationService } = require("../services/qualifications.js");
const { uploadQualification } = require("../middleware/upload.js");

const getAllQualificationsController = async (req, res) =>{
    const{ keyword, page, limit} = req.query;
    const allQual = await QualificationService.getAll(keyword, page, limit);
    return res.status(200).json(allQual);
};

const createQualificationController = async (req, res) => {
    const { position_type_id, note } = req.body;
    const { userId, role, email } = req.user;
    try {
        const createdQual = await QualificationService.create(position_type_id, note, userId);
        return res.status(201).json(createdQual);
    } catch (error) {
        if (error.message.includes("User already has")){ return res.status(409).json({error: error.message});}
        if (error.message.includes("Not Found")){return res.status(404).json({error: error.message})};
         if (error.message.includes("Bad Request")){return res.status(400).json({error: error.message})};
    }
};

const retrieveQualificationController = async (req, res) => {
    const qualificationId = parseInt(req.params.qualificationId);

    if (isNaN(qualificationId)) {
        return res.status(404).json({error: "invalid qualification id"});
    }

    try{
        const qualification = await QualificationService.getOne(qualificationId, req.user);
        return res.status(200).json(qualification);
    } catch (error){
        if (error.message.includes("Forbidden")){
            return res.status(403).json({error: error.message});
        };
        if (error.message.includes("Not Found")){
            return res.status(404).json({error: error.message});
        };
    }
};

const updateQualificationController = async (req, res) => {
    const {qualificationId} = req.params;
    const {status, note} = req.body;
    const user = req.user;

    const qualId = parseInt(qualificationId);

    if (isNaN(qualId)) {
        return res.status(404).json({error : "invalid qualificationid"});
    }

    try {
        const qualification = await QualificationService.update(user, qualId, status, note);
        return res.status(200).json(qualification);
    } catch (error) {
        if (error.message.includes("Not Found")){return res.status(404).json({error: error.message})};
        if (error.message.includes("Forbidden")){return res.status(403).json({error: error.message})};
        return res.status(500).json({error: error.message})
    }
};

async function uploadQualificationController( req, res ) {
    const qualificationId = parseInt(req.params.qualificationId);
    const user= req.user;

    if (user.role !== "regular") {
        return res.status(400).json({error : "invalid account type, need to be user"});
    }

    if (isNaN(qualificationId)) {
        return res.status(400).json({error : "invalid qualificationid"});
    }

    if (!qualificationId) {
        return res.status(404).json({error: "qualification id not found"});
    }

    uploadQualification.single("file") (req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: "No file provided for qualification" });
            }

            const qualification = await QualificationService.getOneForDoc(qualificationId, user);
            const updated = await QualificationService.updateDocument(qualificationId, req.file.path);
            return res.status(200).json({document: updated.document});
            
        } catch (error) {
            if (error.message.includes("Not Found")){return res.status(404).json({error: error.message});};
            if (error.message.includes("Bad Request")){return res.status(400).json({error: error.message})};
            if (error.message.includes("Forbidden")) {return res.status(403).json({ error: "Access denied" });}
        }
    });
}

module.exports = { getAllQualificationsController, createQualificationController, retrieveQualificationController, updateQualificationController, uploadQualificationController };
