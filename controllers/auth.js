const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc Register user
//@route GET /api/v1/register
//@access Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  //Create token
  //getSignedJwtToken() is a method function created on the UserSchema, hence it can be accessed from
  //the instance of UserSchema
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token: token });
});

//@desc Login user
//@route POST /api/v1/login
//@access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("PLease provide an email and password", 400));
  }

  //Check for user
  //Matching the user's email coming from the request body
  //with the user's email in the database
  //password is included with email in the user. necessary for validation
  const user = await User.findOne({ email: email }).select("+password");
  console.log("user:--");
  console.log(user);

  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //Check if password matches
  //matchPassword is method on UserSchema
  //password arg below is the password fetched from req body
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Create token
  //getSignedJwtToken() is a method function created on the UserSchema, hence it can be accessed from
  //the instance of UserSchema
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token: token });
});
