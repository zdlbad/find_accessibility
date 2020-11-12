const { ObjectId } = require('mongoose').Types;
const filterObject = require('./objectFilter');

class QueryDigester {
  constructor(query, reqQueryObj) {
    this.query = query;
    this.reqQueryObj = reqQueryObj;
  }

  filter() {
    const queryObj = filterObject.exclude(this.reqQueryObj, 'sort', 'fields', 'limit', 'page');
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt|ne|in|nin)/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  digesetReviewQuery() {
    // only accepte specified fields
    this.reqQueryObj = filterObject.include(this.reqQueryObj, 'id', 'rating', 'user', 'location');

    if (this.reqQueryObj.location) this.reqQueryObj.location = new ObjectId(this.reqQueryObj.location);
    if (this.reqQueryObj.user) this.reqQueryObj.user = new ObjectId(this.reqQueryObj.user);

    return this;
  }

  digestLocationQuery() {
    // only accepte specified fields
    this.reqQueryObj = filterObject.include(
      this.reqQueryObj,
      'id',
      'ratingAvg',
      'within',
      'center',
      'locationType',
      'parkingOccupied',
      'trainStationHasLift',
      'toiletWheelChairAccessible',
      'toiletForMale',
      'toiletForFemale'
    );

    //reverse filter for searching location attributes
    this.reqQueryObj = filterObject.reverseFilter(
      this.reqQueryObj,
      'parkingOccupied',
      'trainStationHasLift',
      'toiletWheelChairAccessible',
      'toiletForMale',
      'toiletForFemale'
    );

    // digest in/nin filter value
    if (this.reqQueryObj.locationType) {
      const types = JSON.parse(this.reqQueryObj.locationType);
      this.reqQueryObj.locationType = types;

      if (this.reqQueryObj.locationType.in)
        this.reqQueryObj.locationType.in = this.reqQueryObj.locationType.in.split(',');
    }

    // make $getWithin filter
    if (this.reqQueryObj.within && this.reqQueryObj.center) {
      const { within, center } = this.reqQueryObj;
      const [lng, lat] = center.split(',');
      const radius = within / 6378.1;
      this.query.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
      });
      this.reqQueryObj.within = undefined;
      this.reqQueryObj.center = undefined;
    }

    return this;
  }

  sort() {
    if (this.reqQueryObj.sort) {
      const sortObj = this.reqQueryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortObj);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  select() {
    if (this.query.fields) {
      const selectedFields = this.reqQueryObj.sort.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //query.skip(10).limit(10)  10 items in one page, skip first 10
    const page = this.reqQueryObj.page * 1 || 1;
    const limit = this.reqQueryObj.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  digestAll() {
    this.filter().sort().select().paginate();

    return this;
  }
}

module.exports = QueryDigester;
