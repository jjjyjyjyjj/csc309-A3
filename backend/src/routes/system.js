// system
const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const { updateSystemConfig } = require("../config/system");

// PATCH /system/reset_cooldown - Change the reset cooldown for /auth/resets
router.patch('/reset-cooldown', authenticate, requireRole('administrator'), (req, res) => {
    const { reset_cooldown } = req.body;
    if (reset_cooldown===undefined || typeof reset_cooldown !== "number"){
        return res.status(400).json({error:"Bad request reset_cooldown is required"})
    };
    if (reset_cooldown < 0) {
        return res.status(400).json({ error: 'Bad request reset_cooldown < 0' });
    };
    updateSystemConfig('reset_cooldown', reset_cooldown);
    return res.status(200).json({ reset_cooldown });
    
});

// PATCH /system/negotiation_window - Change the duration window for negotiations
router.patch('/negotiation-window', authenticate, requireRole('administrator'), (req, res) => {
    const { negotiation_window } = req.body;
    if (negotiation_window===undefined || typeof negotiation_window!== "number"){
        return res.status(400).json({error:"Bad request negotiation_window is required"})
    };
    if (negotiation_window <= 0) {
        return res.status(400).json({error: "Bad request negotiation_window <=0" });
    };
    updateSystemConfig('negotiation_window', negotiation_window);
    return res.status(200).json({ negotiation_window });
    
});

// PATCH /system/job_start_window - Change the limit for how far ahead you can set the job start time for a posting
router.patch('/job-start-window', authenticate, requireRole('administrator'), (req, res) => {
    const { job_start_window } = req.body;
    if (job_start_window===undefined || typeof job_start_window !== "number"){
        return res.status(400).json({error:"Bad request job_start_window is required"})
    };
    if (job_start_window <= 0) {
        return res.status(400).json({ error: 'Bad request' });
    };

    updateSystemConfig('job_start_window', job_start_window);
    return res.status(200).json({job_start_window });
    
});

// PATCH /system/availability_timeout - Change the amount of time inactive before the regular user is considered unavailable
router.patch('/availability-timeout', authenticate, requireRole('administrator'), (req, res) => {
    const { availability_timeout } = req.body;
    if (availability_timeout===undefined || typeof availability_timeout !== "number"){
        return res.status(400).json({error:"Bad request, availability_timeout is required"})
    };
    if (availability_timeout <= 0) {
        return res.status(400).json({ error: 'Bad request' });
    };
    updateSystemConfig('availability_timeout', availability_timeout);
    return res.status(200).json({ availability_timeout });
    
});

module.exports = router;