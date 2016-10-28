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
var url = "https://api.yelp.com/v2/search/?"; // yelp api website
var place = "";
app.set('view engine', 'ejs');
var fields = {};

function yelpReq(loc){
    var httpMethod = 'GET';
    var parameters = {
        location: loc,
        sort: '2',
        limit: '5',
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
    return apiURL;
    //https.request(apiURL, function(res){
    //
    //});
}

app.get('/', function (req, res) {
    res.render('index', {looked:""});
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
    

    var myURL = yelpReq(place);
    request.get(myURL)
    .on('response', function(response){
        var resultObj = JSON.parse(response);
            
        resultObj.businesses.forEach(function(business){
                var businessObj = {};
                businessObj.Name = business.name;
                businessObj.Rating = business.rating;
                businessObj.Snippet = business.snippet_text;
                releventDataArr.push(businessObj);
        });
        res.write(releventDataArr);
    }).pipe(res);
            
            
   
    
    
    
});

app.listen(process.env.PORT || 4000);