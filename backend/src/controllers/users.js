const { UserService } = require("../services/users.js");
const { QualificationService } = require("../services/qualifications.js");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt");
const { getSystemConfig } = require("../config/system.js");
const { uploadAvatar, uploadResume } = require("../middleware/upload.js");

async function createUserController(req, res) {
    const { first_name, last_name, email, password, phone_number, postal_address, birthday } = req.body;

    if (first_name === undefined || last_name === undefined || email === undefined || password === undefined) {
        return res.status(400).json({ error: "Create User: Invalid payload" });
    }

    const check = await UserService.retrieve({ email });

    if (check !== null) {
        return res.status(409).json({ error: "Create User: Email already exists" });
    }

    // valid format email
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
        return res.status(400).json({ error: "Create User: Invalid email" });
    }

    // password verification
    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({ error: "Create User: password too short" });
    }

    const upper = password.toUpperCase();
    const lower = password.toLowerCase();

    if (password === upper || password === lower) {
        return res.status(400).json({ error: "Create User: password either does not have a lower or higher case char" });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Create User: password needs number" });
    }

    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!specialChars.test(password)) {
        return res.status(400).json({ message: "Create User: password needs spec char" });
    }

    // birthday check
    let birthdayValue = birthday;
    if (birthdayValue === undefined) {
        birthdayValue = "1970-01-01";
    } else {
        const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!birthdayRegex.test(birthdayValue)) {
            return res.status(400).json({ error: "Birthday must be in YYYY-MM-DD format" });
        }
        const date = new Date(birthdayValue);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Birthday is not a valid date" });
        }
    }

    // const { error } = await response.json();
    // if (error !== undefined) {
    //     return res.status(400).json({ error: `error thrown for reset token call: ${error}` });
    // }
    const hashedPassword = await bcrypt.hash(password, 10);

    const resetToken = uuidv4();
    const resetExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newAccount = await UserService.create({
        email,
        password: hashedPassword,
        role: "regular",
        first_name,
        last_name,
        phone_number,
        postal_address,
        birthday: new Date(birthdayValue),
        resetToken: resetToken,
        resetExpiresAt: resetExpiresAt
    });

    // URL hard encoding prob should change
    // const response = await fetch("http://localhost:3000/auth/resets", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email })
    // });
    
    // const { resetToken, expiresAt } = await response.json();

    // const { error } = await response.json();
    // if (error !== undefined) {
    //     return res.status(400).json({ error: `error thrown for reset token call: ${error}` });
    // }

    return res.status(201).json({
        id: newAccount.id,
        first_name,
        last_name,
        email,
        activated: newAccount.activated,
        role: newAccount.role,
        phone_number,
        postal_address,
        birthday: birthdayValue,
        createdAt: newAccount.createdAt,
        resetToken,
        resetExpiresAt
    });
}

async function suspendUserController(req, res) {
    const { userId } = req.params;
    const {suspended} = req.body;
    try{
        if (suspended === undefined){
            return res.status(400).json({error: "Bad Request"});
        };
        const user = await UserService.suspend(userId, suspended);
        return res.status(200).json(user);
    } catch(error){
        if (error.message.includes("Bad Request")){
            return res.status(400).json({error: error.message});
        };
        if (error.message.includes("Not Found")){
            return res.status(404).json({error:error.message});
        };
        return res.status(500).json({ error: "Internal Server Error" });
    }}

async function getUsersController(req, res) {
    const { keyword, last_name, email, page, limit }=req.query;
    const activated = req.query.activated !== undefined ? req.query.activated === 'true' : undefined;
    const suspended = req.query.suspended !== undefined ? req.query.suspended === 'true' : undefined; 
    
    try {
        const list = await UserService.findMany(keyword, activated, suspended, last_name, email, page, limit);
        return res.status(200).json(list);
    } catch (error){
        if (error.message.includes("Bad Request")){
            return res.status(400).json({error: error.message})
        }
            return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getUserProfileController(req, res) {
    const { userId, role, email } = req.user;

    const user = await UserService.retrieve({ id: userId });
    const config = await getSystemConfig();

    if (user === null) {
        return res.status(400).json({ error: "could not find the user??" });
    }

    let available = user.available;

    if ((Date.now() - new Date(user.last_active)) > config.availability_timeout) {
        available = false;
    }

    return res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        activated: user.activated,
        suspended: user.suspended,
        available,
        role: user.role,
        phone_number: user.phone_number,
        postal_address: user.postal_address,
        birthday:  user.birthday ? user.birthday.toISOString().split('T')[0] : null,
        createdAt: user.createdAt,
        avatar: user.avatar.length === 0? null : user.avatar,
        resume: user.resume,
        biography: user.biography,
        qualifications: user.qualifications || []
    });
}


async function updateUserProfileController(req, res) {
    const { userId, role, email } = req.user;
    const { first_name, last_name, phone_number, postal_address, birthday, avatar, biography } = req.body;

    if (first_name === null || last_name === null) {
        return res.status(400).json({ error: "First and last name cannot be null" });
    }

    const data = {}
    const where = { id: userId }

    if (first_name !== undefined) {
        data.first_name = first_name;
    }

    if (last_name !== undefined) {
        data.last_name = last_name;
    }

    if (phone_number !== undefined) {
        data.phone_number = phone_number;
    }

    if (postal_address !== undefined) {
        data.postal_address = postal_address;
    }

    // birthday check
    let birthdayValue = birthday;
    if (birthdayValue !== undefined) {
        const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!birthdayRegex.test(birthdayValue)) {
            return res.status(400).json({ error: "Birthday must be in YYYY-MM-DD format" });
        }
        const date = new Date(birthdayValue);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Birthday is not a valid date" });
        }

        data.birthday = new Date(birthdayValue);
    }

    if (avatar !== undefined) {
        data.avatar = avatar;
    }

    if (biography !== undefined) {
        data.biography = biography;
    }

    try {
        const updated= await UserService.update(where, data);
        return res.status(200).json(updated)
    } catch (error){

        return res.status(400).json({error: error.message})

    }
}



async function makeUserProfileAvailableController(req, res) {
    const { userId, role, email } = req.user;
    const { available } = req.body;

    if (available === null || (available !== true && available !== false && available !== "true" && available !== "false")) {
        return res.status(400).json({error: "Bad request: invalid available field, needs to be boolean"})
    }

    const qual = await QualificationService.findApprovedQualifications(userId, true);
    const user = await UserService.retrieve({id: userId});

    if ((qual === null || user.suspended === true) && (available === true || available === "true")) {
        return res.status(400).json({error: "Bad request: profile has no approved qualifications and or is suspended so cannot set availability to true"})
    }

    await UserService.update({id: userId}, {available});

    return res.status(200).json({available});
}

async function uploadUserAvatarController(req, res) {
    uploadAvatar.single("file")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "no file provided" });
        }

        const { email } = req.user;
        const avatar = req.file.path;

        await UserService.update({ email }, { avatar });
        return res.status(200).json({ avatar });
    });
}

async function uploadUserResumeController(req, res) {
    uploadResume.single("file")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "no file provided" });
        }

        const { email } = req.user;
        const resume = req.file.path;

        await UserService.update({ email }, { resume });
        return res.status(200).json({ resume});

    });
}


// need to test
async function getUserInvitationsController(req, res) {
    const { limit, page } = req.query;
    const { userId, role, email } = req.user;

    if ((page && isNaN(parseInt(page))) || (limit && isNaN(parseInt(limit)))) {
        return res.status(400).json({ error: "limit and page need to be numeric" });
    }

    let pageUpdate = parseInt(page) || 1;
    const take = Math.max(1, parseInt(limit) || 10);
    const skip = (Math.max(1, parseInt(pageUpdate) || 1) - 1) * take;

    const {jobs, count} = await UserService.findInvitations(userId, skip, take);

    return res.status(200).json({
        count,
        results: jobs.map(job => ({
            id: job.job_id,
            status: job.status,
            position_type: {
                id: job.position_type.position_id,
                name: job.position_type.name,
            },
            business: {
                id: job.business.id,
                business_name: job.business.business_name,
            },
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            start_time: job.start_time,
            end_time: job.end_time,
            updatedAt: job.updatedAt,
        }))
    });
}

async function getUserInterestsController(req, res) {
    const { page, limit } = req.query;
    const { userId} = req.user;

    if ((page && isNaN(parseInt(page))) || (limit && isNaN(parseInt(limit)))) {
        return res.status(400).json({ error: "limit and page need to be numeric" });
    }

    let pageUpdate = parseInt(page) || 1;
    const take = parseInt(limit) || 10;
    const skip = (pageUpdate - 1 ) * take;

    try {
        const {interests, count} = await UserService.findInterests(userId, skip, take);

        return res.status(200).json({
            count: count,
            results: interests.map(interest => ({
                interest_id: interest.interest_id,
                mutual: (interest.business_interest && interest.user_interest),
                job: {
                    id: interest.job.job_id,
                    status: interest.job.status,
                    position_type: { 
                        id: interest.job.position_type.position_id, 
                        name: interest.job.position_type.name
                    },
                    business: { 
                        id: interest.job.business.id,
                        business_name: interest.job.business.business_name 
                    },
                    salary_min: interest.job.salary_min,
                    salary_max: interest.job.salary_max,
                    start_time: interest.job.start_time,
                    end_time: interest.job.end_time,
                    updatedAt: interest.job.updatedAt
                },
            }))
        });
    } catch (error) {
        return res.status(500).json({ error: "internal server error" });
    }
}

module.exports = { createUserController, suspendUserController, getUsersController, getUserProfileController, updateUserProfileController, makeUserProfileAvailableController, uploadUserAvatarController, uploadUserResumeController, getUserInvitationsController, getUserInterestsController };