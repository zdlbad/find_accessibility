const express = require('express');
const locationController = require('../controllers/locationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').post(locationController.getLocations);
router.route('/visitedLocations').get(authController.protect, locationController.getUserReviewedPostion);

module.exports = router;
