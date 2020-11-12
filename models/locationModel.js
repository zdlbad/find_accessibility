const mongoose = require('mongoose');

const locationSchema = mongoose.Schema(
  {
    locationType: {
      type: String,
      enum: ['parking', 'toilet', 'trainStation'],
      required: [true, 'Location must have a location type'],
    },
    name: {
      type: String,
      required: [true, 'Location must have a name'],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    ratingAvg: {
      type: Number,
      default: 3.0,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    parkingOccupied: Boolean,
    trainStationHasLift: Boolean,
    toiletWheelChairAccessible: Boolean,
    toiletForMale: Boolean,
    toiletForFemale: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

locationSchema.index({ location: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
