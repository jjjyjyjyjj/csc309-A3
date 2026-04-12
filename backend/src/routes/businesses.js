const express = require("express");
const router = express.Router();

const {createBusinessController, retrieveBusinessesController, retrieveOneBusinessController, verifyBusinessController, createNewJobController, getBusinessProfileController, updateBusinessProfileController, uploadBusinessAvatarController, getBusinessJobsController, updateJobController, deleteJobController} = require("../controllers/businesses.js")
const {authenticate, requireRole, authenticatePass } = require("../middleware/auth.js");
const { upload } = require("../middleware/upload.js");

// businesses
router.route("")
    .post(createBusinessController).get(authenticatePass, retrieveBusinessesController).all((req, res) => {
    res.set("Allow", "POST", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // POST /businesses & GET /businesses

router.route("/me")
    .get(authenticate, requireRole("business"), getBusinessProfileController)
    .patch(authenticate, requireRole("business"), updateBusinessProfileController)
    .all((req, res) => {
        res.set("Allow", "GET", "PATCH");
        return res.status(405).json({
        error: "Method Not Allowed"});
    }); // PATCH /businesses/me

router.route("/me/avatar")
    .put(authenticate, requireRole("business"), uploadBusinessAvatarController)
    .all((req, res) => {
        res.set("Allow", "PUT");
        return res.status(405).json({
        error: "Method Not Allowed"});
    }); // PUT /businesses/me/avatar
   

router.route("/:businessId")
    .get(authenticatePass, retrieveOneBusinessController)
    .all((req, res) => {
    res.set("Allow", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // GET /businesses/:businessId

router.route("/:businessId/verified")
    .patch(authenticate, requireRole("administrator"), verifyBusinessController).all((req, res) => {
    res.set("Allow", "PATCH");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // PATCH /businesses/:businessId/verified

router.route("/me/jobs")
    .post(authenticate, requireRole("business"), createNewJobController)
    .get(authenticate, requireRole("business"), getBusinessJobsController)
    .all((req, res) => {
    res.set("Allow", "POST", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // POST /businesses/me/jobs & GET /businesses/me/jobs      

router.route("/me/jobs/:jobId")
    .patch(authenticate, requireRole("business"), updateJobController)
    .delete(authenticate, requireRole("business"), deleteJobController)
    .all((req, res) => {
    res.set("Allow", "PATCH", "DELETE");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // PATCH /businesses/me/jobs/:jobId
    


module.exports = router;