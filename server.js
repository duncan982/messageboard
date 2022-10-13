"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://wuwcrv-3000.preview.csb.app/; script-src 'self' https://wuwcrv-3000.preview.csb.app/; style 'self' https://wuwcrv-3000.preview.csb.app/; connect-src 'self' https://wuwcrv-3000.preview.csb.app/"
  );
  next();
});

mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("MongoDB is now connected."));

//Sample front-end
app.route("/b/:board/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
