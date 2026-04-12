const express = require("express");
const router = express.Router();
const {getAllQualificationsController, createQualificationController, retrieveQualificationController, updateQualificationController, uploadQualificationController } = require("../controllers/qualifications");
const {authenticate, requireRole} = require("../middleware/auth");

// qualifications
router.route("").get(authenticate, requireRole("administrator"), getAllQualificationsController)
.post(authenticate, requireRole("regular"), createQualificationController).all((req, res) => {
    res.set("Allow", "GET", "POST");
    return res.status(405).json({
    error: "Method Not Allowed"});}) // GET /qualifications & POST /qualifications

router.route("/:qualificationId")
.get(authenticate,requireRole("regular", "business", "administrator"), retrieveQualificationController)
.patch(authenticate, requireRole("regular", "administrator"), updateQualificationController).all((req, res) => {
    res.set("Allow", "GET", "PATCH");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // GET /qualifications/:qualificationId & PATCH /qualifications/:qualificationId

router.route("/:qualificationId/document")
    .put(authenticate, requireRole("regular"), uploadQualificationController)
    .all((req, res) => {
        res.set("Allow", "PUT");
        return res.status(405).json({
        error: "Method Not Allowed"});}); 
        // PUT /qualifications/:qualificationId/document
    

module.exports = router;