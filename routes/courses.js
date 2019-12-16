const express = require("express");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require("../controllers/courses");
const router = express.Router({ mergeParams: true });
const Course = require("../models/Course");
//We will add this method to whichever route that needs to be protected
const { protect } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResult");

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description"
    }),
    getCourses
  )
  .post(protect, addCourse);
router
  .route("/:id")
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
