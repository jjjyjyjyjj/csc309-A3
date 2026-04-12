const {NegoService} = require("../services/negotiations");

// POST /negotiations - Start a negotiation for a job
const postNegotiationController = async (req, res) => {
    const{interest_id} = req.body;
    const user = req.user;

    if (!interest_id) {
        return res.status(400).json({error: "interest id cannot be empty"});
    }

    try {
        const {negotiation, created} = await NegoService.create(user, interest_id);

        if (created) {
            return res.status(201).json(negotiation);
        }

        return res.status(200).json(negotiation);
    } catch (error){
        if (error.message.includes("Forbidden")){
            return res.status(403).json({message: error.message});
        };
        if (error.message.includes("Not Found")){
            return res.status(404).json({message: error.message});
        };
        if (error.message.includes("Conflict")){
            return res.status(409).json({message: error.message});
        };

        return res.status(500).json({message: "internal server error"});
    }
};


// GET /negotiations/me - Retrieve the authenticated users' current negotiation
const getNegotiationController = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;
    try {
        const negotiation = await NegoService.retrieve(userId, role);
        if (!negotiation) {
            return res.status(404).json({ error: "no active negotiation found" });
        }
        return res.status(200).json(negotiation);
    } catch (error){
        if (error.message.includes("Not Found")) {
            return res.status(404).json({ error: error.message });
        }
        
        return res.status(500).json({ error: "Internal server error" });
    }
};

// PATCH /negotiations/me/decision - Set the authenticated party's decision for an active negotiation
const patchNegotiationController= async (req, res) => {
    const {decision, negotiation_id} = req.body;
    const user = req.user;
    
     if (!decision) {return res.status(400).json({ error: "decision is required" });}
    if (!negotiation_id) {return res.status(400).json({ error: "negotiation_id is required" });}
    if (!["accept", "decline"].includes(decision)) {return res.status(400).json({ error: "decision must be 'accept' or 'decline'" });}
    const parsedNegotiationId = parseInt(negotiation_id);
    
    if (isNaN(parsedNegotiationId)) {
        throw new Error("Not Found - Invalid negotiation ID");
    }

    try{
        const negotiation = await NegoService.decide(user, decision, negotiation_id);
        return res.status(200).json(negotiation);
    } catch (error) {
        if (error.message.includes("Not Found")){
            return res.status(404).json({message: error.message});
        };
        if (error.message.includes("Conflict")){
            return res.status(409).json({message: error.message});
        };

        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {postNegotiationController, getNegotiationController, patchNegotiationController};