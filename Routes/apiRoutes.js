// Scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Scraping tools
var Comment = require("../models/Note.js");
var Article = require("../models/Article.js");

// Exporting 
module.exports = function(app){
	// GET website and scrape it
	app.get("/scrape", function(req, res) {
	    // Get the body of the html with request
	    request("https://www.stlucianewsonline.com/category/all-news/financebusiness/", function(error, response, html) {
	        // Load into Cheerio and save it to $ for a shorthand selector
	        var $ = cheerio.load(html);
	        // Now, we grab every h2 within an article tag, and do the following:
	        $("article h2").each(function(i, element) {

	            // Save an empty result object
	            var result = {};

	            // Add the text, href, every link, and save them as properties of the result object
	            result.title = $(this).children("a").text();
	            result.link = $(this).children("a").attr("href");
	        
	            // Using the Article model, create a new entry
	            // This effectively passes the result object to the entry (and the title and link)
	            var entry = new Article(result);

	            // Now, save that entry to the db
	            entry.save(function(err, doc) {
	                // Log any errors
	                if (err) {
	                    console.log(result);
	                }
	                // Or log the doc
	                else {
	                    console.log(doc);
	                }
	            });

	        });
	    });
	    // Tell the browser that we finished scraping the text
	    res.send("Scrape Complete");
	});

	// This will get the articles we scraped from the mongoDB
	app.get("/articles", function(req, res) {
	    // Grab every doc in the Articles array
	    Article.find({}, function(error, doc) {
	        // Log any errors
	        if (error) {
	            console.log(error);
	        }
	        // Or send the doc to the browser as a json object
	        else {
	            res.json(doc);
	        }
	    });
	});

	// Grab an article by it's ObjectId
	app.get("/articles/:id", function(req, res) {
	    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
	    Article.findOne({ "_id": req.params.id })
	    // ..and populate all of the comments associated with it
	        .populate("comment")
	        // now, execute our query
	        .exec(function(error, doc) {
	            // Log any errors
	            if (error) {
	                console.log(error);
	            }
	            // Otherwise, send the doc to the browser as a json object
	            else {
	                res.json(doc);
	            }
	        });
	});


	// Create a new comment or replace an existing comment
	app.post("/articles/:id", function(req, res) {
	    // Create a new comment and pass the req.body to the entry
	    var newComment = new Comment(req.body);

	    // And save the new comment the db
	    newComment.save(function(error, doc) {
	        // Log any errors
	        if (error) {
	            console.log(error);
	        }
	        // Otherwise
	        else {
	            // Use the article id to find and update it's comment
	            Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
	            // Execute the above query
	                .exec(function(err, doc) {
	                    // Log any errors
	                    if (err) {
	                        console.log(err);
	                    }
	                    else {
	                        // Or send the document to the browser
	                        res.send(doc);
	                    }
	                });
	        }
	    });
	});

};