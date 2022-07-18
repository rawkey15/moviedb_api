var express = require('express');
var app = express();
var request = require('request');
const aes256 = require('aes256');
//const Buffer = require('buffer/').Buffer;

const CryptoJS = require('crypto-js');

const ENC_KEY = 'a8418fcd735a3551d9e29e465e1c01a1'; // set random encryption key length 32 
const imageToBase64 = require('image-to-base64');
const axios = require('axios').default;

app.set('port', (process.env.PORT || 5000));

//setup cross-origin
var cors =  {
    origin: ["<<your allowed domains>>"],
    default: "<<your default allowed domain>>" 
};

app.use(function(req, res, next) {

  var origins = cors.origin.indexOf(req.header('origin')) > -1 ? req.headers.origin : cors.default;

  res.header("Access-Control-Allow-Origin", '*');

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  next();

});


app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//Router for rest api

var v3_apikey = '<<your api key obtained from themoviedb.org>>';
var v4_authToken = 'Bearer<<your authToken obtained from themoviedb.org>>';

app.get('/search/:movie', function(req, res, next) {
var moviename = req.params.movie;
  request({
    uri: 'https://api.themoviedb.org/3/search/movie?api_key='+v3_apikey+'&query='+moviename
  }).pipe(res);
});

app.get('/movie/:id', function(req, res, next) {
var movieid = req.params.id;
  request({
    uri: 'https://api.themoviedb.org/3/movie/'+movieid+'?api_key='+v3_apikey+'&append_to_response=videos'
  }).pipe(res);
});

app.get('/movieslist', function(req, res, next) {

var options = { method: 'GET',
  url: 'https://api.themoviedb.org/4/list/1',
  qs: 
   { language: 'english',
     api_key: v3_apikey,
     page: '1' },
  headers: 
   { authorization: v4_authToken,
     'content-type': 'application/json;charset=utf-8' },
  body: {},
  json: true };

request(options).pipe(res);
});

 app.post('/rss/newList', function (req, res) {
   const postData = req.body;
    // Decrypt
    var bytes = CryptoJS.AES.decrypt(postData.source, ENC_KEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    var config = {
        headers: { 'Content-Type': 'text/xml' }
    };

    axios.get(originalText, config).then(({ data }) => {
        const plaintext = data.toString();
        var ciphertext = CryptoJS.AES.encrypt(plaintext, ENC_KEY).toString();
        res.send(ciphertext);
    });
});
app.post('/rss/data', function (req, res) {
    const postData = req.body;
    // Decrypt
    var bytes = CryptoJS.AES.decrypt(postData.source, ENC_KEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    axios.get(originalText).then(({ data }) => {
        const plaintext = JSON.stringify(data);
        var ciphertext = CryptoJS.AES.encrypt(plaintext, ENC_KEY).toString();
        res.send(ciphertext);
    });

});

app.post('/rss/history', function (req, res) {
    const postData = req.body;
    // Decrypt
    var bytes = CryptoJS.AES.decrypt(postData.source, ENC_KEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    request({
        method: 'GET',
        uri: originalText,
        headers: {
            'Content-Type': 'application/xml',
            'Access-Control-Request-Headers': '*',
        },
    }, function (error, response, body) { 
        const plaintext = body.toString();
        var ciphertext = CryptoJS.AES.encrypt(plaintext, ENC_KEY).toString();
        res.send(ciphertext);
    })


});






