const { ObjectId } = require('mongoose').Types;
const catchAsync = require('../utils/catchAsync');
const Location = require('../models/locationModel');
const Reviews = require('../models/reviewModel');
const QueryDigester = require('../utils/QueryDigester');

exports.getLocations = catchAsync(async (req, res, next) => {
  console.log('Query received: ', req.query);
  const queryDigester = new QueryDigester(Location.find(), req.query);
  const finalQuery = queryDigester.digestLocationQuery().digestAll().query;
  const locations = await finalQuery;
  console.log(locations);
  res.status(200).json({
    status: 'success',
    data: {
      count: locations.length,
      locations,
    },
  });
});

exports.getUserReviewedPostion = catchAsync(async (req, res, next) => {
  //1. get user id
  const userId = req.user.id;

  //2. get locaiton's reviews, return review have same user
  const reviewedLocaitons = await Reviews.aggregate([
    {
      $match: {
        user: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'reviewedLocaitons',
      },
    },
    {
      $unwind: {
        path: '$reviewedLocaitons',
      },
    },
    {
      $addFields: {
        _id: '$reviewedLocaitons._id',
        location: '$reviewedLocaitons.location',
        locationType: '$reviewedLocaitons.locationType',
        name: '$reviewedLocaitons.name',
        ratingAvg: '$reviewedLocaitons.ratingAvg',
      },
    },
    {
      $project: {
        _id: 1,
        location: 1,
        locationType: 1,
        name: 1,
        ratingAvg: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      locations: reviewedLocaitons,
    },
  });
});
