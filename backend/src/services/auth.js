const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { rateLimiter } = require("../util/rateLimiter");
const { updateSystemConfig, getSystemConfig} = require("../config/system");
const {SECRET_KEY, JWT_EXPIRY} = require("../config/jwt");
const { v4: uuidv4 } = require('uuid');

class AuthService {
    // POST auth/resets - Request for a password reset, which will reset in 7 days.
    static async requestReset(email, ip) {
        if (!email || !email.includes("@")) {
            throw new Error("Bad Request");
        };  

        const account = await prisma.account.findUnique({
            where: { email: email }
        });

        if (!account) {
            const fakeToken = uuidv4();
            const fakeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return { resetToken: fakeToken, expiresAt: fakeExpiry };
        };
        // get reset cooldown
        const config = getSystemConfig();
        const reset_cooldown = config.reset_cooldown;

        if (!rateLimiter(reset_cooldown, ip)) {
            throw new Error("Too many requests");
        };
        const resetToken = uuidv4();  
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const data = {resetToken: resetToken, resetExpiresAt: expiresAt, resetTokenUsed:false};

        await prisma.account.update({
            where: { email },
            data: data,
        });
        return { resetToken, expiresAt };
    };

// POST /auth/resets/:resetToken - Given a reset token, activate an account OR reset its password.
    static async resetOrActivateService(email, password, resetToken) {
        if (!email || !resetToken || resetToken === "undefined"){
            throw new Error("Bad Request - email not found/ invalid reset token");
        }

        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!pattern.test(email) || !email.includes("@")) {
            throw new Error("Unauthorized - Reset password/ activate: Invalid email" );
        }

        const user = await prisma.account.findFirst({
            where: { 
                resetToken: resetToken},
        });

        if (!user) {
            throw new Error("Unauthorized");
        };

        if (user.resetTokenUsed){
            throw new Error("Not Found");
        }

        if (user.resetExpiresAt < new Date()) {
            throw new Error("Gone");
        };

        if (user.email !== email){
            throw new Error("Unauthorized");
        };

        const data = {
            activated: true,
            resetToken: null,       
            resetExpiresAt: null,
            resetTokenUsed: true,
        };

        if (password){
            // if (password.length < 8 || password.length > 20) {
            //     return res.status(400).json({ error: "Reset password: password too short" });
            // };

            // const upper = password.toUpperCase();
            // const lower = password.toLowerCase();

            // if (password === upper || password === lower) {
            //     return res.status(400).json({ error: "Reset password: password either does not have a lower or higher case char" });
            // };

            // if (!/\d/.test(password)) {
            //     return res.status(400).json({ error: "Reset password: password needs number" });
            // };

            // const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            // if (!specialChars.test(password)) {
            //     return res.status(400).json({ message: "Reset password: password needs spec char" });
            // };

            data.password= await bcrypt.hash(password, 10);
        };

        const updatedUser = await prisma.account.update({
            where: { email: email},
            data: data,
        });

        return updatedUser;
    };

    // POST /auth/tokens - Authenticate an account holder and generate a JWT token
    static async generateTokenService(email, password) {
        if (!email || !password){
            throw new Error("Bad Request - email or password not found");
        }
        const user = await prisma.account.findUnique({
            where: { email: email }
        });

        console.log("user: ", user);
        if (!user) {
            throw new Error("Unauthorized - account holder does not exist");
        };

        // console.log('Hashed Password: ', user.password);
        // console.log("type:", typeof user.password);
        // console.log("input password:", password);

        const passCheck = await bcrypt.compare(password, user.password);
        console.log("passCheck:", passCheck);
        if (!passCheck) {
            throw new Error("Unauthorized - passwords do not match");
        };
        
        if (!user.activated) {
            throw new Error("Forbidden - accounnt not activated");
        };
        // console.log("calling jwt ");
        // console.log("SECRET_KEY:", SECRET_KEY);  
        // console.log("JWT_EXPIRY:", JWT_EXPIRY); 
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: JWT_EXPIRY });
        //  console.log("token generated:", token);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // console.log("expiresAt: ", expiresAt);
        await prisma.account.update({
            where: {email: user.email},
            data: { jwtToken: token, jwtExpiresAt: expiresAt},
        });
    

        return { token, expiresAt };
    };
}

module.exports = {AuthService};