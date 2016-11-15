var request = require('request');
var formidable = require('formidable');
var util = require('util');
var qs = require('query-string');
var oauthSignature = require('oauth-signature');
var nonce = require('nonce');
var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({ extended: false });
var _ = require('underscore');
var releventDataArr = [];
var bcrypt = require('bcryptjs');
var db = require('./nightowlDb.js');
var User = require('./models/userNightowl.js');
var jwt = require('jsonwebtoken');
var middleware = require('./nightowlMiddleware.js')(db);
var express = require('express');
var app = express();
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs()); 
app.set('view engine', 'handlebars');
app.use(bodyParser.json()); 
var url = "https://api.yelp.com/v2/search/?"; // yelp api website
var place = "";
var fields = {};
var resultObj = {};

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
    res.sendFile(__dirname + '/views/nightowlSignIn.html');
}); //need to use html page for this to work

app.post('/login', function(req, res){
    var bodyStr = '';
    req.on('data', function(chunk){
        bodyStr += chunk.toString();
    });
    req.on('end', function(){
        var creds = {};
        //res.send(bodyStr);
        var arr = bodyStr.split('&');
        arr.forEach(function(field){
            var fieldArr = field.split("=");
            creds[fieldArr[0]] = fieldArr[1];
        });
        
        console.log(creds.username);
        var username = creds.username;
        var password = creds.password;
        db.user.findOne({
            where: {
                username: username
            }
        }).then(function(user){
            if(!user || !bcrypt.compareSync(password, user.get('password_hash'))){ //validate password
                res.status(401).send(); //auth is possible but failed
            } //if login is successful, I want a token to be generated for the user
            var token = user.generateToken('authentication');
            if(token){
                res.header('Auth', token).send('logged in');
            } else {
                res.status(401).send();
            }
        }, function(){
            res.status(401).send();
        });
    });
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

app.get('/newuser', function(req,res){
    res.sendFile(__dirname + '/views/nightowlLoginpage.html');
});

app.post('/newuser', function(req, res){
        var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
        var arr = bodyStr.split("&");
        arr.forEach(function(field){
            var fieldArr = field.split("=");
            resultObj[fieldArr[0]] = fieldArr[1];
        });
        console.log(resultObj);
        db.user.create({ //creating the salt and hash works better with .create() than it does with findOrCreate() which didn't work'       
            email: resultObj.email,
            username: resultObj.username,
            password: resultObj.password
        }).then(function(user){
            res.send("success!");
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

app.get('/place', middleware.requireAuthentication, function (req, res) {
    yelpReq(place, res);
}); //for now i'll require auth'

db.sequelize.sync({force: true}).then(function(){
    app.listen(4000, function(){
        console.log('express listening on port 4000');
    });
});