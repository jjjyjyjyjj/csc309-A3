// routes/auth.js
const express = require('express');
const router = express.Router();
const { requestResetController, resetOrActivateController, authenticateUserController } = require('../controllers/auth');

// POST /auth/resets - Request password reset
router.route("/resets").post(requestResetController).all((req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  });;  // POST /auth/resets

router.route("/resets/:resetToken").post(resetOrActivateController).all((req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  });;  // POST /auth/resets/:resetToken

router.route("/tokens").post(authenticateUserController).all((req, res) => {
    res.set("Allow", "POST");
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  });;  // POST /auth/tokens

module.exports = router;