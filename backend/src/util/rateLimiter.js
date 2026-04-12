const resetAttempts = new Map();

function rateLimiter(cooldownTime, ip){
    const currentTime = Date.now();
    const lastAttempt = resetAttempts.get(ip);

    if (lastAttempt) {
        const timeSinceLastAttempt = (currentTime - lastAttempt) / 1000;

        if (timeSinceLastAttempt < cooldownTime) {
            return false;
        }
    }

    resetAttempts.set(ip, currentTime);
    return true;
};

module.exports = { rateLimiter};