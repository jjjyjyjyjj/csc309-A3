/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
    const [username, email, password] = process.argv.slice(2);
    if (!username || !email || !password) {
        console.error("Usage: node prisma/createsu.js <username> <email> <password>");
        process.exit(1);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.account.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
                role: 'administrator',
                activated: true,
            },
        });
        console.log("Admin created:", user);
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();