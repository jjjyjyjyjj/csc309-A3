const express = require("express");
const router = express.Router();
const {createUserController, suspendUserController, getUsersController, getUserProfileController, updateUserProfileController, makeUserProfileAvailableController, uploadUserAvatarController, uploadUserResumeController, getUserInvitationsController, getUserInterestsController} = require("../controllers/users")
const {authenticate, requireRole, authenticatePass } = require("../middleware/auth");

// users
router.route("")
    .post(createUserController)
    .get(authenticate, requireRole("administrator"), getUsersController)
    .all((req, res) => {
        res.set("Allow", "POST, GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

router.route("/:userId/suspended")
    .patch(authenticate, requireRole("administrator"), suspendUserController)
    .all((req, res) => {
        res.set("Allow", "PATCH");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

router.route("/me")
    .get(authenticate, requireRole("regular","administrator"), getUserProfileController)
    .patch(authenticate, requireRole("regular"), updateUserProfileController)
    .all((req, res) => {
        res.set("Allow", "GET", "PATCH");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

router.route("/me/avatar")
    .put(authenticate, requireRole("regular"), uploadUserAvatarController)
    .all((req, res) => {
        res.set("Allow", "PUT");
        return res.status(405).json({
        error: "Method Not Allowed"});
    }); // PUT /users/me/avatar


router.route("/me/resume")
    .put(authenticate, requireRole("regular"), uploadUserResumeController)
    .all((req, res) => {
        res.set("Allow", "PUT");
        return res.status(405).json({
        error: "Method Not Allowed"});
    }); // PUT /users/me/avatar
   

router.route("/me/available")
    .patch(authenticate, requireRole("regular"), makeUserProfileAvailableController)
    .all((req, res) => {
        res.set("Allow", "PATCH");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

router.route("/me/invitations")
    .get(authenticate, requireRole("regular"), getUserInvitationsController)
    .all((req, res) => {
        res.set("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

router.route("/me/interests")
    .get(authenticate, requireRole("regular"), getUserInterestsController)
    .all((req, res) => {
        res.set("Allow", "GET");
        return res.status(405).json({ error: "Method Not Allowed" });
    });

module.exports = router;
