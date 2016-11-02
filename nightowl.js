var request = require('request');
var formidable = require('formidable');
var util = require('util');
var qs = require('query-string');
var oauthSignature = require('oauth-signature');
var nonce = require('nonce');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var releventDataArr = [];
//
//var mongoose = require('mongoose');
//var config = require('./config');
var db = require('./nightowlDb.js');
var jwt = require('jsonwebtoken');
var User = require('./models/userNightowl.js');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
//{defaultLayout: 'index'}
app.set('view engine', 'handlebars');
var url = "https://api.yelp.com/v2/search/?"; // yelp api website
var place = "";
var fields = {};

//mongoose.connect(config.database); //connect to database
//app.set('dinosaur', config.secret); //secret variable


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

//var account;

app.post('/sampleuser', urlencodedParser, function(req, res){
    db.user.create(req.body).then(function(user){
        res.send('Success! Your account has been created.');
        console.log(user);
    }, function(err){
        res.status(400).send();
    });
    //jaune.save(function(err){
      //  if(err) throw err;
      //  console.log('user saved');
      //  res.send(jaune.username);
    //});
});

app.get('/newuser', function(req,res){
    //res.render('newuser');
    res.sendFile(__dirname + '/views/nightowlLoginpage.html');

});
//urlencodedParser,
app.post('/newuser', urlencodedParser, function(req, res){
    //var form = {
        //email: req.body.email,
        //username: req.body.username,
        //password: req.body.password
    //};
    //var formData = qs.stringify(form);
    //var formLength = formData.length;
    //request({
       // headers: {
        //    'Content-Length': formLength,
        //    'Content-Type': 'application/x-www-form-urlencoded'
        //},
        //url: 'http://localhost:4000/newuser',
       // body: formData,
       // method: 'POST'
    //}, function(err, response, body){
        var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
        var arr = bodyStr.split("&");
        var resultObj = {};
        arr.forEach(function(field){
            var fieldArr = field.split("=");
            resultObj[fieldArr[0]] = fieldArr[1];
        });
        
        db.user.findOrCreate({
        where: {
            email: resultObj.email,
            username: resultObj.username,
            password: resultObj.password
        }
        }).then(function(user){
            res.json(user.toJSON());
        }, function(error){
            res.status(400).send();
        });
    });
    
});

app.get('/users', function(req, res) {
  db.user.findAll().then(function(users){
      console.log(users);
      res.json(users.toJSON());
  });
});   

//app.post('/login', urlencodedParser, function(req, res){
  // db.user.findOne(
      // where: {
    //       username: req.body.username
     //  }
  // ).then(function(user){
       //console.log(user.toJSON());
    ///   res.send('logged in!');
 //  }, function(error){
 //      res.status(400).send();
 //  });
//});

app.get('/place', function (req, res) {
    yelpReq(place, res);
});

db.sequelize.sync().then(function(){
    app.listen(4000, function(){
        console.log('express listening on port 4000');
    });
});