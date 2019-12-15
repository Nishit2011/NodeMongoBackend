const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"]
  },
  email: {
    type: String,
    required: [true, "Please add email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email"
    ]
  },
  role: {
    type: String,
    enum: ["user", "publisher"]
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false //using this parameter will ensure that password isnt fetched
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createAt: {
    type: Date,
    default: Date.now
  }
});

//Encrypt password using bcrypt
//Putting a middleware and run our Schema before it is saved
//When we use middlewares like these, we have access to the fields in Models
UserSchema.pre("save", async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
//methods are functions that are defined on Model and will also exist on instances of Model
//statics are functions that are defined directly on Model only

UserSchema.methods.getSignedJwtToken = function() {
  //passing the payload to jwt sign in method, along with other params,
  //this method will be available to instances of this schema
  //an instance in controller will invoke this method and a jwt token will be created
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

//Need to match the password passed with the request and match it with
//the encrypted password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  //enteredPassword is the password that is passed from the request
  //this.password is the password fromt the database
  //this.password is fetched when the findOne query is run and user credententials are gatheres in user object
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
