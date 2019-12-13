const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//in this file, we have wrapped few methods into a async await handler in async.js
//this way avoid writing try catch repeatedly
//for other functions, we have left it as it is

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  //fetching query parameters from request
  //http://localhost:5000/api/v1/bootcamps?housing=true&&location.state=MA
  //in the above request obj, housing=true and location.state are query params

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //trying to edit the query params fetched from req by adding money sign
  //so that greater and lesser than operation can be executed and those operations in mongoose use $gte, $lt etc
  //so when a req of the form http://localhost:5000/api/v1/bootcamps/?averageCost[lte]=10000 is made
  //using the below operation, it is turned into  {"averageCost":{"$lte":"10000"}} to get the results of those data that have average cost less than or equal to 10000

  //Create operators($gt $gte etc)
  queryStr = queryStr.replace(/\b(gte|gte|lt|lte|in)\b/g, match => `$${match}`);

  //parsing back the query string to be executed by mongoose
  ///Finding resources
  //populating bootcamp document with course document based on the Virtuals created
  //in Bootcamp model
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Executing query

  const bootcamps = await query;

  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

//@desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  //the bottom if check handles for those id that are correctly formatted by are not present in databse
  //the catch block will handle fr request that are not correclty formatted, say the id's length is something gibberish

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc Create single bootcamp
//@route POST /api/v1/bootcamps/
//@access Public
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    console.log(bootcamp);
    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

//@desc Update   bootcamp
//@route PUT /api/v1/bootcamps
//@access Public
exports.updateBootcamp = async (req, res, next) => {
  // new: true,
  //runValidators: true
  //the first property show that if the data is uodated it should be considered as new data
  //and the second property indicates that the mongoose validators to run once the data is updated
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcampuuuuuu not found with id ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc Update   bootcamp
//@route DELETE /api/v1/bootcamps/:ID
//@access Public
exports.deleteBootcamp = async (req, res, next) => {
  try {
    //getting the bootcamp
    //findByIdandDelete is changed to findById and remove method is used
    //to enforce cascading delete functionality, which means once Bootcamp is deleted
    //course will be deleted too.

    const bootcamp = await Bootcamp.findById(req.params.id);

    //Using the middleware remove method instead of using findByIdAndDelete
    bootcamp.remove();
    res.status(200).json({ success: true, data: {} });
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
      );
    }
  } catch (err) {
    next(err);
  }
};

//@desc Get bootcamps within radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calc radius using radians
  //Divide dist by radius of Earth
  //Earth Radius = 3,963 mi/6,378 kms

  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
