let config = {    
    "reset_cooldown": 1, // in seconds, default 1 hour?
    "negotiation_window": 900, //in seconds, default to 15 mins
    "job_start_window": 168, // in hours, default 7 days
    "availability_timeout": 300, // in seconds, default to 5 minutes
};

const getSystemConfig = () => config;

const updateSystemConfig = (key, value) => {
    config[key] = value;
};

module.exports = { getSystemConfig, updateSystemConfig };
