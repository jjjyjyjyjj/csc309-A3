const express = require("express");
const router = express.Router();

const {postNegotiationController, getNegotiationController, patchNegotiationController} = require("../controllers/negotiations");
const {authenticate, requireRole, authenticatePass } = require("../middleware/auth");

// negotiations
router.route("")
.post(authenticate, requireRole("regular", "business"), postNegotiationController).all((req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({ 
    error: "Method Not Allowed" });});// POST /negotiations

router.route("/me")
.get(authenticate, requireRole("regular", "business"), getNegotiationController).all((req, res) => {
    res.set("Allow", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // GET /negotiations/me

router.route("/me/decision")
.patch(authenticate, requireRole("regular", "business"), patchNegotiationController).all((req, res) => {
    res.set("Allow", "PATCH");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // PATCH /negotiations/me/decision

module.exports = router;