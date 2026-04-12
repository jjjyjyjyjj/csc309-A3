const {JobService} = require("../services/jobs");

const getAllJobsController = async (req, res) => {
    const {lat, lon, position_type_id, business_id, sort, order, page, limit} = req.query;
    try{
        const jobs = await JobService.getAllJobs(lat, lon, position_type_id, business_id, sort, order,page, limit);
        return res.status(200).json(jobs)
    } catch (error){
        
    if (error.message.includes("Bad Request")) {
        return res.status(400).json({error: error.message});
        }
        return res.status(500).json({error: "other error"});
    }
};

const getJobDetailsController = async(req, res) => {
    const {jobId} = req.params;
    const {lat, lon} = req.query;
    const userId = req.user.userId;
    const role = req.user.role;
    const parsedJobId = parseInt(jobId);

    if ((lat && !lon) || (!lat && lon)) {
        return res.status(400).json({  error:  "Both lat and lon must be provided"}); }

    try{
        const job = await JobService.getJobDetails(parsedJobId,userId, role, lat, lon);
        return res.status(200).json(job);
    } catch (error){
        if (error.message.includes("Bad Request")) {
            return res.status(400).json({ 
                error: error.message
            });
        }
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ 
                error: error.message
            });
        }
        if (error.message.includes("Not Found")) {
            return res.status(404).json({ 
                error: error.message
            });
        }
        return res.status(500).json({error: "other error"});
    }
    
};

const cancelJobController = async (req,res) => {
    const {jobId} = req.params;
    const {userId} = req.user;
    const parsed_jobId = parseInt(jobId);

    if (isNaN(parsed_jobId)){
        return res.status(400).json({error: "business ID should be a number"})
    }

    try{
        const job = await JobService.retrieveOne({ job_id: parsed_jobId });
        
        if (!job) {
            return res.status(404).json({ error: "job not found" });
        }

        if (job.business_id !== userId) {
            return res.status(403).json({ error: "businesses can only report or their own job" });
        }

        const cancelledJob = await JobService.cancel(parsed_jobId);
        return res.status(200).json(cancelledJob);

    } catch (error) {
        if (error.message.includes("Not Found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Conflict")) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes("Bad Request")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({error: "other error"});
    }
}

const showInterestJobController = async (req, res) => {
    const {interested} = req.body;
    const {jobId} = req.params;
    const userId = req.user.userId;
    const parsed_jobId = parseInt(jobId);

    if (isNaN(parsed_jobId)){
        return res.status(400).json({error: "job id should be a number"});
    }
    if (interested===undefined ||  interested === null){return res.status(400).json({error: "interest field not given"})};
    if (typeof interested !== 'boolean') {return res.status(400).json({ error: "interested must be a boolean" });}

    try{
        const job = await JobService.expressInterest(parsed_jobId, userId, interested);
        return res.status(200).json(job);

    } catch (error){
        if (error.message.includes( "Bad Request")){
            return res.status(400).json({error: error.message});
        };
        if (error.message.includes("Forbidden")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes("Not Found")){
            return res.status(404).json({error: error.message});
        };
        if (error.message.includes("Conflict")){
            return res.status(409).json({error: error.message});
        };
        return res.status(500).json({error: "other error"});
    }
};

const getAllCandidatesController = async (req, res) =>{
    const {jobId} = req.params;
    const{page, limit} = req.query;
    const businessId = req.user.userId;
    const parsed_jobId = parseInt(jobId);

    try{
        const qualifiedCandidates = await JobService.getAllQualified(businessId, parsed_jobId, page, limit);
        return res.status(200).json(qualifiedCandidates);
    } catch(error){
        if (error.message.includes("Not Found")){ return res.status(404).json({error: error.message})};
        return res.status(500).json({error: "other error"});
    }
}; 

const getOneCandidateController = async (req, res) =>{
    const {jobId, userId} = req.params;
    const businessId = req.user.userId;
    const parsed_jobId = parseInt(jobId);
    const parsed_userId = parseInt(userId);

    if (isNaN(parsed_jobId) || isNaN(parsed_userId)){
        return res.status(400).json({error:"ids should be a number"})
    }
    try{
        const candidate = await JobService.getOneQualified(businessId, parsed_jobId, parsed_userId);
        return res.status(200).json(candidate);
    } catch (error){
        if (error.message.includes("Forbidden")){ return res.status(403).json({error: error.message})};
        if (error.message.includes("Not Found")){ return res.status(404).json({error: error.message})};
        return res.status(500).json({error: "other error"});}
}; 

const inviteCandidateController = async (req, res) => {
    const {jobId, userId} = req.params;
    const {interested} = req.body;
    const businessId = req.user.userId;
    const parsed_jobId = parseInt(jobId);
    const parsed_userId = parseInt(userId);

    if (isNaN(parsed_jobId) || isNaN(parsed_userId)){
        return res.status(400).json({error:"ids should be a number"})
    }
    if (interested === undefined || interested === null || typeof(interested)!== "boolean"){
        return res.status(400).json({error:"interest field should be boolean"})
    } 
    
    try {
        const candidate = await JobService.sentInvite(businessId, parsed_jobId, parsed_userId, interested);
        return res.status(200).json(candidate);
    } catch (error){
        if (error.message.includes("Bad Request")){ return res.status(400).json({error: error.message})};
        if (error.message.includes("Forbidden")){ return res.status(403).json({error: error.message})};
        if (error.message.includes("Not Found")){ return res.status(404).json({error: error.message})};
        if (error.message.includes("Conflict")){ return res.status(409).json({error: error.message})};
        return res.status(500).json({error: "other error"});
    }
}; 

const getInterestsController = async (req, res) =>{
    const {jobId} = req.params;
    const{page, limit} = req.query;
    const businessId = req.user.userId;
    const parsed_jobId = parseInt(jobId);

    if (isNaN(parsed_jobId)){
        return res.status(400).json({error:"ids should be a number"})
    }

    try{
        const qualifiedCandidates = await JobService.getInterested(businessId, parsed_jobId, page, limit);
        return res.status(200).json(qualifiedCandidates);
    } catch(error){
        if (error.message.includes("Not Found")){ return res.status(404).json({error: error.message})};
        if (error.message.includes("Forbidden")){ return res.status(403).json({error: error.message})};
        return res.status(500).json({error: "other error"})};
};

module.exports = {getAllJobsController, getJobDetailsController, cancelJobController, showInterestJobController,getAllCandidatesController, getOneCandidateController,inviteCandidateController, getInterestsController};