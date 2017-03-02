// Dependencies
var express = require("express");
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Port number 
var PORT = 3000;

// Set mongoose to Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Set Handlebars as the default templating engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan and body parser with our app
app.use(logger("dev"));

app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/news-scrape");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Log a success message once logged in to DB
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// require html Routes  file 
require('./Routes/htmlRoutes.js')(app);
// require api Routes file.
require('./Routes/apiRoutes.js')(app);

// Listen on PORT
app.listen(3000, function() {
    console.log("App running on port: " + PORT + "!");
});
