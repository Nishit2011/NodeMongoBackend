const express = require("express");
const dotenv = require("dotenv");

const logger = require("./middleware/logger");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Route files
const bootcamps = require("./routes/bootcamps");

connectDB();

const app = express();

//Body parser
app.use(express.json());

//Dev logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//app.use(logger);
//Mount routers
app.use("/api/v1/bootcamps", bootcamps);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode on port ${PORT}`.magenta
      .bold
  )
);

//Handle unhandled promise rejection like wrong db password
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});