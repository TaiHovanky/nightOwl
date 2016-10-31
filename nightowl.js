var request = require('request');
var formidable = require('formidable');
var util = require('util');
var qs = require('query-string');
var oauthSignature = require('oauth-signature');
var nonce = require('nonce');
var releventDataArr = [];
var mongoose = require('mongoose');
var config = require('./config');
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
//{defaultLayout: 'index'}
app.set('view engine', 'handlebars');
var url = "https://api.yelp.com/v2/search/?"; // yelp api website
var place = "";
var fields = {};

mongoose.connect(config.database); //connect to database
app.set('dinosaur', config.secret); //secret variable


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
        resultObj.businesses.forEach(function(business){
                var businessObj = {};
                businessObj.Image = business.image_url;
                businessObj.URL = business.url;
                businessObj.Name = business.name;
                businessObj.Rating = business.rating;
                businessObj.Snippet = business.snippet_text;
                releventDataArr.push(businessObj);
        });        
        res.render('index', {releventDataArr: releventDataArr});
    });
    
}

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/login', function(req, res){
    res.render('login');
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

var account;

app.get('/sampleuser', function(req, res){
    var jaune = new User({
        username:'arkos4life',
        password: 'yuleavemepyrha'
    });
    jaune.save(function(err){
        if(err) throw err;
        console.log('user saved');
        res.send(jaune.username);
    });
})

app.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

app.post('/login', function(req, res){
   User.findOne({
       username: req.body.username
   }, function(err, user){
       if(err) throw err;
       if(!user){
           res.send("Login failure");
       } else if(user) {
           if(user.password != req.body.password){
               res.send('Login failure!');
           } else {
               var token = jwt.sign(user, app.get('dinosaur'), {
                   expiresInMinutes: 1440
               });
               console.log(token);
               res.send('success');
           }
       }
   });
});

app.get('/place', function (req, res) {
    yelpReq(place, res);
});

app.listen(process.env.PORT || 4000);