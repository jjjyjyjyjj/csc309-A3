'use strict';

const express = require("express");
const cors = require('cors');
const path = require('path');
import 'dotenv/config';
require('dotenv').config(); 

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

    app.use(express.json());
    // Set up cors to allow requests from your React frontend
    app.use(cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
        }));
        
    // app.use('/uploads', express.static('uploads'));    
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
