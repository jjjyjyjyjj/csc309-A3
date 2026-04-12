const express = require("express");
const router = express.Router();

const {createPositionController, getAllPositionsController, editPositionController, deletePositionController} = require("../controllers/position-types");
const {authenticate, requireRole, authenticatePass } = require("../middleware/auth");

// position-types
router.route("").post(authenticate, requireRole("administrator"), createPositionController)
.get(authenticate, requireRole("regular", "business", "administrator"),
    getAllPositionsController).all((req, res) => {
    res.set("Allow", "POST", "GET");
    return res.status(405).json({
    error: "Method Not Allowed"});}); // POST /positions & GET /positions

router.route("/:positionTypeId").patch(authenticate, requireRole("administrator"), editPositionController)
.delete(authenticate, requireRole("administrator"), deletePositionController).all((req, res) => {
    res.set("Allow", "PATCH", "DELETE");
    return res.status(405).json({
    error: "Method Not Allowed"});});// PATCH /position-types/:positionTypeId & DELETE /position-types/:positionTypeId

module.exports = router;
