const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");

//@desc Get all courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    //populating courses with all the related bootcamp document
    //query = Course.find().populate("bootcamp");

    //populating Course with name and fields from Bootcamp document

    res.status(200).json(res.advancedResults);
  }
});

//@desc Get single course
//@route GET /api/v1/courses/:id
//@access Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the is of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc Adding a single course
//@route GET /api/v1/bootcamps/:/bootcampId/courses
//@access Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  //botcamp referes to the bootcamp in Course model used for establishing relationship
  //fetching the bootcampId and putting it in the  body of bootcamp request
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp course with the is of ${req.params.bootcampId}`
      ),
      404
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc Update course
//@route PUT /api/v1/courses/:id
//@access Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No bootcamp course with the is of ${req.params.bootcampId}`
      ),
      404
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc Delete course
//@route DELETE /api/v1/courses/:id
//@access Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No bootcamp course with the is of ${req.params.bootcampId}`
      ),
      404
    );
  }
  //using the middleware method remove to remove instead of using
  //findByIdAndDelete
  //remove is a SchemaMethod that is invoked only by instance of Mongoose Document
  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
