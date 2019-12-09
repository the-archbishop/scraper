// DEPENDENCIES
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

module.exports = function(router) {
    
    // Route to render the home page
    router.get("/", function(req, res){
        db.Headline.find({}).then(function(data) {
            let articleData = {
                articles: data
            };
            res.render("home", articleData);
        }).catch(function(err) {
            res.json(err);
        });
    });

    // Route to render the saved page
    router.get("/saved", function(req, res){
        res.render("saved");
    });

    // A GET route for scraping HuffPo
    router.get("/scrape", function(req, res){
        // Grab the body of the html with axios
        axios.get("https://search.huffpost.com/search?p=coffee+%26+crime").then(function(response) { 
            // Then, we load that into cheerio and save it to $
            var $ = cheerio.load(response.data);

            $(".bt-dbdbdb").each(function(i, element) {
                var result = {};

                result.headline = $(this)
                    .children("a")
                    .attr("title").trim();
                result.link = $(this)
                    .children("a")
                    .attr("href");
                result.imgUrl = $(this)
                    .children("a")
                    .children("img")
                    .attr("src");
                result.summary = $(this)
                    .children("p")
                    .text();
                result.date = $(this)
                    .children("div")
                    .children("p")
                    .children("span:nth-child(2)")
                    .text()

                console.log(result);
                db.Headline.create(result)
                    .then(function(dbHeadline) {
                        // View the added result in the console
                        console.log(dbHeadline);
                    })
                    .catch(function(err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });

            // Send a message to the client
            res.send("Scrape Complete");
        });
    });
}