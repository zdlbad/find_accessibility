const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// authentication
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/updatepassword').patch(authController.protect, authController.updatePassword);
router.route('/resetpassword/:token').patch(authController.resetPassword);

module.exports = router;
