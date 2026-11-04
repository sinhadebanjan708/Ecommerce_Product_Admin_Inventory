const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');



router.post(
  '/refresh-token',
  authController.refreshToken
);
// Send OTP for Registration
router.post('/register/send-otp', authController.sendRegisterOtp);

router.post('/check-existing-user', authController.existingUser);

// Verify OTP + Create Customer + Assign Role
router.post('/register/verify-otp-create-customer', authController.verifyRegisterOtp);


router.post('/login', authController.sendLoginOtp);

router.post('/login/verify-otp', authController.verifyLoginOtp);

router.post("/logout", authController.logout);


module.exports = router;