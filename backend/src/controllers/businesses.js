
const { BusinessService } = require("../services/businesses.js");
const { getSystemConfig } = require("../config/system.js");
const { PositionService } = require("../services/position-types.js");
const { JobService } = require("../services/jobs.js");
const { uploadAvatar } = require("../middleware/upload.js");

const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt");

async function createBusinessController(req, res) {
    const { business_name, owner_name, email, password, phone_number, postal_address, location } = req.body;

    if (!business_name|| !owner_name|| !email || !password|| !phone_number|| !postal_address|| !location
    ) {
        return res.status(400).json({ error: "Create Business: Invalid payload -> attribute is null" });
    }

    const check = await BusinessService.retrieveAccount({ email });

    if (check !== null) {
        return res.status(409).json({ error: "Create Business: Email already exists" });
    }

    // valid format email
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
        return res.status(400).json({ error: "Create Business: Invalid email" });
    }

    // password verification
    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({ error: "Create Business: password too short" });
    }

    const upper = password.toUpperCase();
    const lower = password.toLowerCase();

    if (password === upper || password === lower) {
        return res.status(400).json({ error: "Create Business: password either does not have a lower or higher case char" });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Create Business: password needs number" });
    }

    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!specialChars.test(password)) {
        return res.status(400).json({ error: "Create Business: password needs spec char" });
    }

    // checking location format
    if (typeof location !== "object" || typeof location.lon !== "number" || typeof location.lat !== "number") {
        return res.status(400).json({ error: "Create Business: Location must be in the format { lon: number, lat: number }" });
    }

    // validate location values
    if (location.lon < -180 || location.lon > 180) {
        return res.status(400).json({ error: "Create Business: lon should be between -180 and 180" });
    }

    if (location.lat < -90 || location.lat > 90) {
        return res.status(400).json({ error: "Create Business: lat should bee between -90 and 90" });
    }

    // making account now
    const resetToken = uuidv4();
    const resetExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = await BusinessService.create({
        email,
        password: hashedPassword,
        role: "business",
        business_name,
        owner_name,
        phone_number,
        postal_address,
        location_lon: location.lon,
        location_lat: location.lat,
        resetToken,
        resetExpiresAt
    });

    return res.status(201).json({
        id: newAccount.id,
        business_name,
        owner_name,
        email,
        activated: newAccount.activated,
        verified: newAccount.verified,
        role: newAccount.role,
        phone_number,
        postal_address,
        location,
        createdAt: newAccount.createdAt,
        resetToken,
        expiresAt: resetExpiresAt
    });
}

async function retrieveBusinessesController(req, res) {
    const isAdmin = req.user?.role === "administrator";
    const { keyword, activated, verified, sort, order = "asc", page = 1, limit = 10 } = req.query;
    if (!isAdmin) {
        if ( activated !== undefined || verified !== undefined || sort === "owner_name") {
            return res.status(400).json({ error: "Retrieve Businesses: user is trying to access admin privileges" });
        }
    }

    // validate sort field
    const allowedSorts = isAdmin ? ["business_name", "email", "owner_name"] : ["business_name", "email"];

    if (sort && !allowedSorts.includes(sort)) {
        return res.status(400).json({ error: "invalid sort field" });
    }

    // validate orderby field
    const allowedOrder = ["asc", "desc"];

    if (!allowedOrder.includes(order)) {
        return res.status(400).json({ error: "invalid order field" });
    }

    // pagination
    let pageUpdate = parseInt(page) || 1;
    const take = Math.max(1, parseInt(limit) || 10);
    const skip = (Math.max(1, parseInt(pageUpdate) || 1) - 1) * take;

    // building the where object
    const where = {};

    // handling keyword search
    if (keyword) {
        const searchFields = [
            { business_name: { contains: keyword }},
            { email: { contains: keyword }},
            { postal_address: { contains: keyword }},
            { phone_number: { contains: keyword }}
        ];

        if (isAdmin) {
            searchFields.push({ owner_name: { contains: keyword }});
        }

        where.OR = searchFields;
    }

    // activated
    if (activated !== undefined) {
        where.activated = activated === "true" || activated === true;
    }

    // verified
    if (verified !== undefined) {
        where.verified = verified === "true" || verified === true;
    }

    where.role = "business";

    const orderBy = sort ? {[sort]: order} : undefined;

    const [businesses, count] = await Promise.all([
        BusinessService.findMany(where, orderBy, take, skip),
        BusinessService.count(where)
    ]);

    let results;

    if (isAdmin) {
        results = businesses.map((elem) => ({
            id: elem.id,
            business_name: elem.business_name,
            email: elem.email,
            role: elem.role,
            phone_number: elem.phone_number,
            postal_address: elem.postal_address,
            owner_name: elem.owner_name,
            verified: elem.verified,
            activated: elem.activated,
        }));
    } else {
        results = businesses.map((elem) => ({
            id: elem.id,
            business_name: elem.business_name,
            email: elem.email,
            role: elem.role,
            phone_number: elem.phone_number,
            postal_address: elem.postal_address
        }));
    }

    return res.status(200).json({
        count,
        results
    });
}

async function retrieveOneBusinessController(req, res) {
    const { businessId } = req.params;
    const isAdmin = req.user?.role === "administrator";

    if (businessId === undefined) {
        return res.status(400).json({ error: "business id is undefined" } );
    }

    const id = parseInt(businessId);

    if (isNaN(id)) {
        return res.status(404).json({ error: "invalid query parameters, page not found" } );
    }

    const business = await BusinessService.retrieveAccount({ id });

    if (business === null) {
        return res.status(404).json({ error: "business doesn't exist" } );
    }

    if (!isAdmin) {
        return res.status(200).json({ 
            id: business.id,
            business_name: business.business_name,
            email: business.email,
            role: "business",
            phone_number: business.phone_number,
            postal_address: business.postal_address,
            location: {
            lon: business.location_lon,
            lat: business.location_lat
            },
            avatar: business.avatar,
            biography: business.biography
        });
    } else {
        return res.status(200).json({ 
            id: business.id,
            business_name: business.business_name,
            email: business.email,
            role: "business",
            phone_number: business.phone_number,
            postal_address: business.postal_address,
            location: {
            lon: business.location_lon,
            lat: business.location_lat
            },
            avatar: business.avatar,
            biography: business.biography,
            owner_name: business.owner_name,
            activated: business.activated,
            verified: business.verified,
            createdAt: business.createdAt
        });
    }
}

async function verifyBusinessController(req,res) {
    const {verified} = req.body;
    const {businessId} = req.params;

    // validate verified is boolean
     if (typeof verified !== 'boolean') {
        return res.status(400).json({ error: "verified must be a boolean" });
    }
    
    const id = parseInt(businessId);
     if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid business ID" });
    }
    let business;
    try{
        business = await BusinessService.verify(id, verified);
    } catch (error) { 
        return res.status(404).json({ error: "Business not found" });
    }
    
    return res.status(200).json(business);
}

async function getBusinessProfileController(req, res) {
    const { userId, role, email } = req.user;

    const business = await BusinessService.retrieveAccount({email});

    return res.status(200).json({
        id: business.id,
        business_name: business.business_name,
        owner_name: business.owner_name,
        email: business.email,
        role: business.role,
        phone_number: business.phone_number,
        postal_address: business.postal_address,
        location: {
            lon: business.location_lon,
            lat: business.location_lat
        },
        avatar: business.avatar,
        biography: business.biography,
        activated: business.activated,
        verified: business.verified,
        createdAt: business.createdAt
    });
}

async function updateBusinessProfileController(req, res) {
    const { userId, role, email } = req.user;
    const { business_name, owner_name, phone_number, postal_address, location, avatar, biography } = req.body;

    const where = { email };
    let data = {};

    if (business_name !== undefined) {
        if (business_name === "") return res.status(400).json({ message: "Business name cannot be empty" });
        data.business_name = business_name;
    }

    if (owner_name !== undefined) {
        if (owner_name === "") return res.status(400).json({ message: "Owner name cannot be empty" });
        data.owner_name = owner_name;
    }

    if (phone_number !== undefined)   data.phone_number   = phone_number;
    if (postal_address !== undefined) data.postal_address = postal_address;
    if (biography !== undefined)      data.biography      = biography;

    if (avatar !== undefined) data.avatar = avatar; // null clears it, string sets it

    if (location !== undefined) {
        const { lon, lat } = location;
        if (typeof lon !== "number" || typeof lat !== "number") {
            return res.status(400).json({ message: "Location must include both lat and lon as numbers" });
        }
        if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
            return res.status(400).json({ error: "Invalid location coordinates" });
        }
        data.location_lon = lon;
        data.location_lat = lat;
    }
    
    if (Object.keys(data).length === 0) {
        return res.status(200).json({});
    }
    
    const updated = await BusinessService.update(where, data);
    
    // build response from only the changed fields
    const response = {id: updated.id };
    
    if (business_name !== undefined) response.business_name = updated.business_name;
    if (owner_name !== undefined)    response.owner_name    = updated.owner_name;
    if (phone_number !== undefined)  response.phone_number  = updated.phone_number;
    if (postal_address !== undefined) response.postal_address = updated.postal_address;
    if (biography !== undefined)     response.biography     = updated.biography;
    if (avatar !== undefined)        response.avatar        = updated.avatar;
    if (location !== undefined)      response.location      = { lon: updated.location_lon, lat: updated.location_lat };
    
    return res.status(200).json(response);
}

async function uploadBusinessAvatarController(req, res) {
    uploadAvatar.single("file")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }
        
        const { userId, role, email } = req.user;
        const avatar = req.file.path;

        const updated = await BusinessService.update({ email }, { avatar });

        return res.status(200).json({ avatar: updated.avatar });
    });
}


// async function createBusinessJobController(req, res){
//     const { userId, role, email } = req.user;
//     const { position_type_id, salary_min, salary_max, start_time, end_time, note } = req.body;

//     if ( !position_type_id || !salary_min || !salary_max || !start_time || !end_time ) {
//         return res.status(400).json({ error: "createBusinessJobController: required field is empty" });
//     }

//     const pos_check = parseInt(position_type_id);
//     if (isNaN(pos_check)) {
//         return res.status(400).json({ error: "createBusinessJobController: position type id needs to be number" });
//     }

//     const min_check = parseInt(salary_min);
//     if (isNaN(min_check) || min_check < 0) {
//         return res.status(400).json({ error: "createBusinessJobController: salary min needs to be number" });
//     }

//     const max_check = parseInt(salary_max);
//     if (isNaN(max_check) || (!isNaN(min_check) && max_check < min_check)) {
//         return res.status(400).json({ error: "createBusinessJobController: position type id needs to be number" });
//     }

//     const start = new Date(start_time);
//     const end = new Date(end_time);

//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: "createBusinessJobController: start_time or end_time is an invalid date" });
//     }

//     if (end <= start) {
//         return res.status(400).json({ error: "createBusinessJobController: end_time must be after start_time" });
//     }



//     const data = {
//         position_id: pos_check,
//         business_id: userId,
//         salary_min: min_check,
//         salary_max: max_check,
//         start_time: start,
//         end_time: end,
//         note,
//     };



//     const createdJob = await JobService.createJob(data);

//     return res.status(201).json({
//         id: createdJob.job_id,
//         status: createdJob.status,
//         position_type: {
//             id: createdJob.position_type.position_id,
//             name: createdJob.position_type.name
//         },
//         business: {
//             id: createdJob.business.id,
//             business_name: createdJob.business.business_name
//         },
//         worker: !createdJob.worker ? null: createdJob.worker.id,
//         note: createdJob.note,
//         salary_min: createdJob.salary_min,
//         salary_max: createdJob.salary_max,
//         start_time: createdJob.start_time,
//         end_time: createdJob.end_time,
//         updatedAt: createdJob.updatedAt,
//     });
// }

// function for creating jobs
async function createNewJobController(req,res) {
    // assumes authentication is all g
    const { userId, role, email } = req.user;
    const { position_type_id, salary_min, salary_max, start_time, end_time, note } = req.body;
    
    const business = await BusinessService.retrieveAccount({ email });

    if (business === null) {
        return res.status(400).json({ error: "something has gone horribly wrong w auth: authenticated business user email doesnt exist in DB"});
    }

    // if not verified 
    if (!business.verified) {
        return res.status(403).json({ error: "createNewJobController: business must be verified in order to make new job postings"});
    }

    if (position_type_id === undefined ||  salary_min === undefined || salary_max === undefined || start_time === undefined || end_time === undefined) {
        return res.status(400).json({ error: "createNewJobController: necessary body param is empty" });
    }

    const salmin = parseFloat(salary_min);
    const salmax = parseFloat(salary_max);

    if (isNaN(salmin) || isNaN(salmax) || salmin < 0 || salmin > salmax) {
        return res.status(400).json({ error: "createNewJobController: salary values are not allowed" });
    }

    // assumes that start_time and end_time are in ISO 8601 format
    const start = new Date(start_time);
    const end = new Date(end_time);
    const now = new Date();

    const config = getSystemConfig();
    const windowMs = config.job_start_window * 60 * 60 * 1000;
    const negotiationMs = config.negotiation_window * 1000;

    if (end <= start) {
        return res.status(400).json({ error: "createNewJobController: start time must be before end time" });
    }

    if (start.getTime() > now.getTime() + windowMs) {
        return res.status(400).json({ error: "createNewJobController: start time too early, shorter than job window" });
    }

    if (start.getTime() < now.getTime() + negotiationMs) {
        return res.status(400).json({ error: "createNewJobController: start time too early, no time for negotiation" });
    }
    const positionType = await PositionService.get({ position_id: parseInt(position_type_id) });
        
    if (!positionType) {
        return res.status(404).json({ error: "Position type not found" });
    }

    const where = {
        id: business.id
    }

    const data = {
        job_postings: { 
            create: {
                salary_min: salmin,
                salary_max: salmax,
                salary_avg: (salmax + salmin) / 2,
                start_time,
                end_time,
                position_id: parseInt(position_type_id),
                note: note || "",
                status: "open"
            }
        } 
    }

    const updatedBusiness = await BusinessService.update(where, data, true);
    const newJob = updatedBusiness.job_postings[0];
    const position = await PositionService.get({position_id: position_type_id})

    return res.status(201).json({
        id: newJob.job_id,
        status: newJob.status, // default open
        position_type: { id: position.position_id, name: position.name },
        business: { id: updatedBusiness.id, business_name: updatedBusiness.business_name },
        worker: null,
        note,
        salary_min,
        salary_max,
        start_time,
        end_time,
        updatedAt: newJob.updatedAt
    });
};



async function getBusinessJobsController(req, res){
    const { userId } = req.user;
    const {position_type_id, salary_min, salary_max, start_time, end_time, status, page, limit} = req.query;

    const where = {
        business_id: userId
    }

    if (position_type_id) {
        const pos_check = parseInt(position_type_id);
        if (isNaN(pos_check)) {
            return res.status(400).json({ error: "getBusinessJobsController: position id must be a number" });
        }
        where.position_id = pos_check;
    }

    if (salary_min) {
        const min_check = parseFloat(salary_min);
        if (isNaN(min_check) || min_check < 0) {
            return res.status(400).json({ error: "getBusinessJobsController: salary min must be a non negative number" });
        }
        where.salary_min = { gte: min_check };
    }

    if (salary_max) {
        const max_check = parseFloat(salary_max);
        if (isNaN(max_check) || max_check < 0) {
            return res.status(400).json({ error: "getBusinessJobsController: salary max must be a non negative number" });
        }
        where.salary_max = { gt: max_check };
    }

    if (start_time) {
        const start = new Date(start_time);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ error: "getBusinessJobsController: start_time is an invalid date" });
        }
        where.start_time = { gt: start };
    }

    if (end_time) {
        const end = new Date(end_time);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ error: "getBusinessJobsController: emd time is an invalid date" });
        }
        where.end_time = { lt: end };
    }

    if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        where.status = { in: statuses };
    } else{
        where.status = { in: ["open", "filled"]};
    }

    const pageNum = parseInt(page) || 1;
    const take = parseInt(limit) || 10;
    const skip = (pageNum - 1) * take;

    const {count, jobs} = await JobService.getJobsForBusiness(where, take, skip);

    let results = jobs.map((elem) => ({
        id: elem.job_id,
        status: elem.status,
        positionType: {
            id: elem.position_type.position_id,
            name: elem.position_type.name
        },
        business_id: elem.business_id,
        worker: elem.worker ? { // need to check if null first
            id: elem.worker.id,
            first_name: elem.worker.first_name,
            last_name: elem.worker.last_name
        } : null,
        salary_min: elem.salary_min,
        salary_max: elem.salary_max,
        start_time: elem.start_time,
        end_time: elem.end_time,
        updatedAt: elem.updatedAt
    }));

    return res.status(200).json({
        count,
        results
    })
}

async function updateJobController(req, res) {
    const { userId } = req.user;
    const { jobId } = req.params;
    const { salary_min, salary_max, start_time, end_time, note } = req.body;

    const job = await JobService.retrieveOne({ job_id: parseInt(jobId) });

    if (!job) {
        return res.status(404).json({ error: "updateJobController: job not found" });
    }

    if (job.business_id !== userId) {
        return res.status(403).json({ error: "updateJobController: unauthorized" });
    }

    const now = new Date();
    if (job.status !== "open" || now >= new Date(job.start_time)) {
        return res.status(409).json({ error: "updateJobController: job closed" });
    }

    const data = {};

    if (salary_min) {
        const min_check = parseInt(salary_min);
        if (isNaN(min_check) || min_check < 0) {
            return res.status(400).json({ error: "updateJobController: salary min must be a non negative number" });
        }
        data.salary_min = min_check;
    }

    if (salary_max) {
        const max_check = parseInt(salary_max);
        if (isNaN(max_check) || max_check < 0) {
            return res.status(400).json({ error: "updateJobController: salary max must be a non negative number" });
        }
        data.salary_max = max_check;
    }

    // checking if any of the new updates would break the rules
    if (data.salary_min !== undefined || data.salary_max !== undefined) {
        const resolvedMin = data.salary_min ?? job.salary_min;
        const resolvedMax = data.salary_max ?? job.salary_max;
        if (resolvedMax < resolvedMin) {
            return res.status(400).json({ error: "updateJobController: salary max must be >= salary min" });
        }
        data.salary_avg = (resolvedMin + resolvedMax) / 2;
    }

    if (start_time) {
        const start = new Date(start_time);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ error: "updateJobController: start_time is an invalid date" });
        }
        data.start_time = start;
    }

    if (end_time) {
        const end = new Date(end_time);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ error: "updateJobController: end_time is an invalid date" });
        }
        data.end_time = end;
    }

    if (data.start_time !== undefined || data.end_time !== undefined) {
        const resolvedStart = data.start_time ?? new Date(job.start_time);
        const resolvedEnd = data.end_time ?? new Date(job.end_time);

        if (resolvedEnd <= resolvedStart) {
            return res.status(400).json({ error: "updateJobController: end_time must be after start_time" });
        }

        const config = getSystemConfig();
        const windowMs = config.job_start_window * 60 * 60 * 1000;
        const negotiationMs = config.negotiation_window * 1000;

        if (resolvedStart.getTime() > now.getTime() + windowMs) {
            return res.status(400).json({ error: "updateJobController: start_time is too far ahead" });
        }

        if (resolvedStart.getTime() < now.getTime() + negotiationMs) {
            return res.status(400).json({ error: "updateJobController: start_time too soon, no time for negotiation" });
        }
    }

    if (note) {
        data.note = note;
    }

    if (Object.keys(data).length === 0) {
        return res.status(200).json({ message: "updateJobController: no fields to update" });
    }

    const updatedJob = await JobService.updateJob({ job_id: parseInt(jobId) }, data);
    
    return res.status(200).json({
        id: updatedJob.job_id,
        salary_min: updatedJob.salary_min,
        salary_max: updatedJob.salary_max,
        note: updatedJob.note,
        updatedAt: updatedJob.updatedAt
    });
}

async function deleteJobController(req, res) {
    const { userId } = req.user;
    const jobId = parseInt(req.params.jobId);

    if (isNaN(jobId)) {
        return res.status(400).json({error: "thats not a number"});
    }
    try{
        const job = await JobService.retrieveOne({ job_id: jobId }, true);

        if (!job) {
            return res.status(404).json({ error: "deleteJobController: job not found" });
        }

        if (job.business_id !== userId) {
            return res.status(403).json({ error: "deleteJobController: unauthorized" });
        }

        if (![ "open","expired"].includes(job.status) || job.negotiations.length > 0) {
            return res.status(409).json({ error: "deleteJobController: job is not open to be deleted" });
        }
        await JobService.deleteJob({job_id: jobId});

        return res.status(204).send();
    }
    catch (error){
        if (error.message.includes("Not Found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Conflict")) {
            return res.status(409).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }

    

}

module.exports = { createBusinessController, retrieveBusinessesController, retrieveOneBusinessController, verifyBusinessController, createNewJobController, getBusinessProfileController, updateBusinessProfileController, uploadBusinessAvatarController, getBusinessJobsController, updateJobController, deleteJobController}