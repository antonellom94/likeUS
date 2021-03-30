var express = require('express');
var request = require('request');
const keys = require("../config/keys")

var app = express();
app.use(express.urlencoded({ extended: false }));

port = 3000;

client_id = keys.googleClientID;
client_secret = keys.googleClientSecret;
code = "";
var a_t = '';

red_uri = "http://localhost:3000/&response_type=code";
red_uri_post = "http://localhost:3000/&grant_type=authorization_code";
var scope = "https://www.googleapis.com/auth/calendar";
var getCode = "https://accounts.google.com/o/oauth2/auth?client_id="+client_id+"&scope="+scope+"&approval_prompt=force&redirect_uri="+red_uri;

app.get('/login', function(req, res){
  var info = "Schermata iniziale per il login a Google";
  res.send(info + "<br><button onclick='window.location.href=\""+ getCode +"\"'>Log in</button>");
});

app.get('/', function(req, res) {
  code = req.query.code;
  var info = "Il codice è: " + code;
  res.send(info + "<br>Clicca qui per richiedere il <button onclick='window.location.href=\"/token\"'>token</button> di accesso");
});

app.get('/token', function(req, res){

  var urlcompleto = "https://accounts.google.com/o/oauth2/token?code="+code+"&client_id="+client_id+"&client_secret="+client_secret+"&redirect_uri="+red_uri_post+"&grant_type=authorization_code";
  
  request.post(urlcompleto, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!\nServer responded with:', body);
    var info = JSON.parse(body);
    a_t = info.access_token;
    res.send("Token preso: "+ a_t + "<br>Clicca qui per ricevere le sue <button onclick='window.location.href=\"/token_info\"'>info</button>");
  });
});

app.get('/token_info', function(req, res){
	
  var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+a_t;

  request.get({
    url:     url
    }, function(error, response, body){
        console.log(body);
        res.send(body+"<br><button onclick='window.location.href=\"/api\"'>Access API</button><br>Non ancora implementato");
  });

});

console.log('Server listen in port '+port+'. Connect to localhost');
app.listen(port);