const express = require("express");
const router = express.Router();

const {getAllJobsController, getJobDetailsController, cancelJobController, showInterestJobController, getAllCandidatesController, getOneCandidateController,inviteCandidateController, getInterestsController} = require("../controllers/jobs");
const {authenticate, requireRole, authenticatePass } = require("../middleware/auth");

// jobs 
router.route("").get(authenticate, requireRole("regular"), getAllJobsController).all((req, res) => {
    res.set("Allow", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}) //GET /jobs

router.route("/:jobId")
.get((req, res, next) => {
      if (isNaN(parseInt(req.params.jobId))) {
        return res.status(404).json({ error: "cannot find this page" });
      }
      next();
    },
    authenticate, 
    requireRole("regular", "business"), 
    getJobDetailsController)
    .all((req, res) => {
    res.set("Allow", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}) //GET /jobs/:jobId

router.route("/:jobId/no-show").patch(authenticate, requireRole("business"), cancelJobController).all((req, res) => {
    res.set("Allow", "PATCH");
    return res.status(405).json({
    error: "Method Not Allowed"});}); //PATCH /jobs/:jobId/no-show

router.route("/:jobId/interested")
    .patch(authenticate, requireRole("regular"), showInterestJobController).all((req, res) => {
    res.set("Allow", "PATCH");
    return res.status(405).json({
    error: "Method Not Allowed"});}); //PATCH /jobs/:jobId/interested

router.route("/:jobId/candidates").get(authenticate,  requireRole("business"),getAllCandidatesController).all((req,res) => {
    res.set("Allow", "GET");
    return res.status(405).json({error: "Method Not Allowed"});}); // GET /jobs/:jobId/candidates

router.route("/:jobId/candidates/:userId").get(authenticate,requireRole("business"),getOneCandidateController).all((req,res)=>{
    res.set("Allow", "GET");
    return res.status(405).json({error: "Method Not Allowed"});}); // GET /jobs/:jobId/candidates/:userId

router.route("/:jobId/candidates/:userId/interested")
    .patch(authenticate, requireRole("business"), inviteCandidateController)
    .all((req,res)=>{
    res.set("Allow", "PATCH");
    return res.status(405).json({error: "Method Not Allowed"});}); // PATCH /jobs/:jobId/candidates/:userId/interested

router.route("/:jobId/interests").get(authenticate,requireRole("business"),getInterestsController).all((req,res)=>{
    res.set("Allow", "GET");
    return res.status(405).json({error: "Method Not Allowed"});});   // GET /jobs/:jobId/interests

module.exports = router;

