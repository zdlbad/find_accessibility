const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use((req, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  next();
});

router.route('/').get(authController.isLoggedIn, viewController.getHomePage);
router.route('/login').get(viewController.login);
router.route('/signup').get(viewController.signup);
router.route('/mypage').get(authController.protect, viewController.getMyPage);
router.route('/updatepage').get(authController.protect, viewController.getUpdatePage);
router.route('/updatepassword').get(authController.protect, viewController.getUpdatePasswordPage);
router.route('/forgotpassword').get(viewController.getForgotPasswordPage);
router.route('/resetpassword/:token').get(viewController.getResetPasswordPage);

module.exports = router;
