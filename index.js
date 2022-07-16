var express = require('express');
var app = express();
var request = require('request');
const AES = require('aes256');
import { Buffer } from 'buffer';

const key = 'H$ek@r~15081984~';
const imageToBase64 = require('image-to-base64');

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

 app.get('/rss/newList', function (req, res) {
        //const postData = req.body;
     
       request({
            method: 'POST',
            uri: 'https://data.mongodb-api.com/app/data-mvwym/endpoint/data/v1/action/findOne',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': '7uSeUtvlvwC1FWEC2QGdtQGs5fS6BcK4QjJJlycpcxtVy4G6gRdr3Q3vyWxB1QDv'
            },
            body: {
                "collection": "user",
                "database": "users",
                "dataSource": "Cluster0"
            },
            json: true
        }, function(error,response, body) {
            const obj = body;
             
             const plaintext = JSON.stringify(obj);
             const buffer = Buffer.from(plaintext);
            //const encryptedPlainText = AES.encrypt(key, plaintext);
            res.send({data: buffer});
            /*imageToBase64(obj.document.personalDetails.picture).then(
                (response) => {
                    console.log(response); // "iVBORw0KGgoAAAANSwCAIA..."
                    res.send({data: encryptedPlainText, pic: response});
                }
            ).catch(
                (error) => {
                    console.log(error); // Logs an error if there was one
                }
            )*/
            
          });
    });







