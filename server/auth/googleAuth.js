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

red_uri = "http://localhost:3000/auth/google/callback";
var scope = "https://www.googleapis.com/auth/calendar";
var googleToken = "https://accounts.google.com/o/oauth2/token";
var getCode = "https://accounts.google.com/o/oauth2/auth?client_id="+client_id+"&scope="+scope+"&approval_prompt=force&response_type=code&redirect_uri="+red_uri;

app.get('/auth/google', function(req, res){
  var info = "Schermata iniziale per il login a Google";
  res.send(info + "<br><button onclick='window.location.href=\""+ getCode +"\"'>Log in</button>");
});

app.get('/auth/google/callback', function(req, res) {
  code = req.query.code;
  var info = "Il codice è: " + code;
  res.send(info + "<br>Clicca qui per richiedere il <button onclick='window.location.href=\"/auth/google/token\"'>token</button> di accesso");
});

app.get('/auth/google/token', function(req, res){

  var getToken = googleToken+"?code="+code+"&client_id="+client_id+"&client_secret="+client_secret+"&grant_type=authorization_code&redirect_uri="+red_uri;
  
  request.post(getToken, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!\nServer responded with:', body);
    var info = JSON.parse(body);
    a_t = info.access_token;
    res.send("Token preso: "+ a_t + "<br>Clicca qui per ricevere le sue <button onclick='window.location.href=\"/auth/google/token_info\"'>info</button>");
  });
});

app.get('/auth/google/token_info', function(req, res){
	
  var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+a_t;

  request.get({
    url:     url
    }, function(error, response, body){
        console.log(body);
        res.send(body+"<br><button onclick='window.location.href=\"/auth/google/api\"'>Access API</button><br>Non ancora implementato");
  });

});

app.get('/auth/google/api', function(req, res){
  var options = {
  url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
  headers: {
    'Authorization': 'Bearer '+ a_t
    }
  };
  request(options, function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info);
    res.send(info.items[2].timeZone + " "+ info.items[2].summary + "<br>" + info.items[2].defaultReminders);
    }
  else {
    console.log(error);
  }
  });

});

console.log('Server listen in port '+port+'. Connect to localhost');
app.listen(port);