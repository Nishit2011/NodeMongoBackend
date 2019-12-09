const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  console.log("error.js");
  let error = { ...err };

  error.message = err.message;
  //Log to console for dev
  console.log(error);

  //by using different if statements here, we are trying to
  //simplify error messages that comes when there's an exception

  //Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Bootcamp not found with id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  //Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error"
  });
};

module.exports = errorHandler;
