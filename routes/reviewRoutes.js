const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(reviewController.getReviews);
router
  .route('/:locationId')
  .post(authController.protect, reviewController.createReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = router;
