const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a tour.'],
    },
    location: {
      type: mongoose.Schema.ObjectId,
      ref: 'Location',
      require: [true, 'Review must belong to a location.'],
    },
    rating: {
      type: Number,
      min: [0, 'A review must have a rating from 0 - 5.'],
      max: [5, 'A review must have a rating from 0 - 5.'],
      required: [true, 'A review must have a rating.'],
      default: 3,
    },
    comment: String,
    createdAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ location: 1, user: 1 }, { unique: true });

reviewSchema.pre('save', function (next) {
  this.createdAt = Date.now();
  next();
});

reviewSchema.pre(/^find/, function (next) {
  const popOption = [];
  popOption.push({ path: 'user', select: 'name' });
  popOption.push({ path: 'location', select: 'name' });
  this.populate(popOption);

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
