var request = require('request');
var formidable = require('formidable');
var https = require('https');
var _ = require('lodash');
var qs = require('query-string');
var oauthSignature = require('oauth-signature');
var nonce = require('nonce');
var releventDataArr = [];
var express = require('express');
var app = express();
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
//{defaultLayout: 'index'}
app.set('view engine', 'handlebars');
var url = "https://api.yelp.com/v2/search/?"; // yelp api website
var place = "";
//app.set('view engine', 'ejs');
var fields = {};

function yelpReq(loc, res){
    var httpMethod = 'GET';
    var parameters = {
        location: loc,
        sort: '2',
        limit: '10',
        category_filter: 'nightlife',
        oauth_consumer_key: "G9M1PQJcKx5l0GaRq8KtPA",
        oauth_token: "OezaVHj9v7HLVAMRJZDGonSCX_pq_UuL",
        oauth_nonce: nonce(),
        oauth_timestamp: Date.now(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0'
    };

    var consumerSecret = "WMYvnN42CyvMqc5dgjfvUHsVOHY";
    var tokenSecret = "EToSdawXK1NW1DUNXEGzyXO_Q4E";
    var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, {encodeSignature: false});
    parameters.oauth_signature = signature;
    var paramURL = qs.stringify(parameters);
    var apiURL = url + paramURL;

    request(apiURL, function(err, response, body){
        var resultObj = JSON.parse(body);
        //releventDataArr.length = 0;
        resultObj.businesses.forEach(function(business){
                var businessObj = {};
                businessObj.Name = business.name;
                businessObj.Rating = business.rating;
                businessObj.Snippet = business.snippet_text;
                businessObj = JSON.stringify(businessObj);
                releventDataArr.push(businessObj);
                //res.render('searchRes', {
                 //   name: business.name,
                 //   rating: business.rating,
                 //   snippet: business.snippet_text    
                //});
        });
        //res.write(releventDataArr);
        console.log(releventDataArr);
        //res.render('index', {releventDataArr: releventDataArr});
        
        res.render('index', {releventDataArr: releventDataArr});
        //res.end();
        //releventDataStr = JSON.stringify(releventDataArr);
        //res.write(releventDataStr);
    });
    
}

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm();
    form.on('field', function(field, value){
        fields[field] = value;
        place = fields[field];
        res.redirect('/place');
        
    });
    form.parse(req);
});

app.get('/place', function (req, res) {
    

    yelpReq(place, res);
    
    //res.render('index', {looked: place});
            
            
   
    
    
    
});

app.listen(process.env.PORT || 4000);