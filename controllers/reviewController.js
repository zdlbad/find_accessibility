const { ObjectId } = require('mongoose').Types;
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const QueryDigester = require('../utils/QueryDigester');

exports.getReviews = catchAsync(async (req, res, next) => {
  if (!req.query.location && !req.query.user) return next(new Error('You must provide location or user information'));

  const queryDigester = new QueryDigester(Review.find(), req.query).digesetReviewQuery().digestAll();
  const reviews = await queryDigester.query;

  res.status(200).json({
    status: 'success',
    count: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // 1. get userId and locationId
  const userId = req.user.id;
  const { locationId } = req.params;

  // 2. get comment body
  const reivewObj = req.body;
  reivewObj.user = userId;
  reivewObj.location = locationId;

  // 3. save to reivew collection
  const data = await Review.create(reivewObj);

  res.status(200).json({
    status: 'success',
    data: {
      message: 'This is reviewController.createReview method.',
      data,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  //1. get userId and locationId
  const { locationId } = req.params;
  const userId = req.user.id;

  //2. remove reivew
  const removedReview = await Review.findOneAndRemove({
    user: new ObjectId(userId),
    location: new ObjectId(locationId),
  });

  res.status(200).json({
    status: 'success',
    data: {
      removedReview,
    },
  });
});
