'use strict';

const express = require("express");
const cors = require('cors');
const path = require('path');
require('dotenv').config(); 
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
function create_app() {
    const app = express();
    const qualificationRoutes = require("./routes/qualifications");
    const userRoutes = require("./routes/users");
    const businessesRoutes = require("./routes/businesses");
    const jobsRoutes = require("./routes/jobs");
    const negotiationRoutes = require("./routes/negotiations");
    const positionRoutes = require("./routes/position-types");
    const systemRoutes = require("./routes/system");
    const authRoutes = require("./routes/auth");

    // Set up cors to allow requests from your React frontend
    const corsOptions= {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
        };
    app.options('*', cors(corsOptions));  // ← must be FIRST, with options
    app.use(cors(corsOptions));
    // app.use((req, res, next) => {
    //     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    //     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    //     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    //     res.setHeader('Access-Control-Allow-Credentials', 'true');
        
    //     if (req.method === 'OPTIONS') {
    //         return res.sendStatus(204);
    //     }
        
    //     next();
    //     });
    app.use(express.json());

    app.use(express.static(path.join(__dirname, '../')));
    app.use("/qualifications", qualificationRoutes);
    app.use("/users", userRoutes);
    app.use("/jobs", jobsRoutes);
    app.use("/businesses", businessesRoutes);
    app.use("/negotiations", negotiationRoutes);
    app.use("/position-types", positionRoutes);
    app.use("/auth", authRoutes);
    app.use("/system", systemRoutes);
    return app;
}

module.exports = { create_app };
