const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const authController = require("../controllers/auth");
const authMiddleware = require('../middlewares/auth');
const middleware = require("../middlewares");

router.post("/register", userController.register);

//request reset password & send to email
router.post("/reset-password", authController.requestResetPassword);

//verify reset password token
router.get("/reset-password/:token", authController.verifyResetPasswordToken);

//reset password
router.post("/reset-password/:token", authController.resetPassword);

router.get("/google", authController.googleOAuth);

//login
router.post("/login", authController.login);

router.get("/who-am-i", middleware.login, authController.whoami);
router.get("/logout", authController.logout);

router.get('/verify-seller', authMiddleware, authController.requestSellerConfirmation);

router.get('/verify-seller/:token', authMiddleware, authController.verifySeller);

module.exports = router;
