var request = require('request');
var formidable = require('formidable');
var express = require('express');
var app = express();
var url = "https://api.yelp.com/v2/search?term=bar&location="; // yelp api website
var place = "";
app.set('view engine', 'ejs');
var fields = {};
//function getSearch(req, fieldsObj){
  //  var form = new formidable.IncomingForm();
    //form.on('field', function(field, value){
      //  fieldsObj[field] = value;
        //console.log(fieldsObj);
        //return fieldsObj;
    //});
    //form.parse(req);
//}

function yelpReq(loc){
    var encodedLoc = encodeURIComponent(loc);
    var finalUrl = url+encodedLoc;
    request(finalUrl, function(err, res, body){
        if(!err){
            console.log(body);
            //console.log(body.businesses);
        }
        //res.render('index', {stuff: body});
    });
}

app.get('/', function (req, res) {
    res.render('index', {looked:""});
});

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm();
    form.on('field', function(field, value){
        fields[field] = value;
        //console.log(fields);
        //res.render('index', {looked:fields[field]});
        place = fields[field];
        res.redirect('/place');
        
    });
    form.parse(req);
});

app.get('/place', function (req, res) {
    res.render('index', {looked:place});
    yelpReq(place);
    console.log(place);
});

app.listen(process.env.PORT || 4000);