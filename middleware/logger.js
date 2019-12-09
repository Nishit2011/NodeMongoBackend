//@desc logs request to console
//other alternative is to use morgan in the dev environment
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};
module.exports = logger;
