var express = require('express');
//var axios = require('axios').default;
var request = require('request');
//var qs = require('querystring');
const keys = require("../config/keys")

var app = express();
var a_t = '';
app.use(express.urlencoded({ extended: false }));

port = 3000;
client_id = keys.googleClientID;
client_secret = keys.googleClientSecret;
red_uri = "http://localhost:3000/&response_type=code";
red_uri_post = "http%3A%2F%2Flocalhost%3A3000%2F&response_type=code";
code = "";

var scope = "https://www.googleapis.com/auth/calendar";
var getCode = "https://accounts.google.com/o/oauth2/auth?client_id="+client_id+"&scope="+scope+"&approval_prompt=force&redirect_uri="+red_uri;

app.get('/login', function(req, res){
  var info = "Schermata iniziale per il login a Google";
  res.send(info + "<br><button onclick='window.location.href=\""+ getCode +"\"'>Log in</button>");
});

app.get('/', function(req, res) {
  code = req.query.code;
  var info = "Il codice è: " + code;
  res.send(info + "<br><button onclick='window.location.href=\"/token\"'>Token</button>");
});

app.get('/token', function(req, res){
  
  var formData = {
    code: code,
    client_id: client_id,
    client_secret: client_secret,
    redirect_uri: red_uri,
    grant_type: 'authorization_code'
  }

  request.post({url: "https://accounts.google.com/o/oauth2/token", form: formData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
    var info = JSON.parse(body);
    a_t = info.access_token;
    res.send("Got the token "+ a_t + "<br><button onclick='window.location.href=\"/token_info\"'>Get Token Info</button>");
  });
/*  
  const data = { 'grant_type': 'client_credentials'};
  const options = {
    url:              urltoken,
    auth: {
      username :      client_id,
      password :      client_secret
    },
		headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify(data)
  };

	axios.request(options).then(function(res){
			console.log(res);
		}).catch(function(err){
      console.log("Error: "+err);
    });
  */
});

app.get('/token_info', function(req, res){
	
  var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+a_t;

request.get({
  url:     url
  }, function(error, response, body){
    console.log(body);
    res.send(body+"<br><br><button onclick='window.location.href=\"/api\"'>Access API</button>");
  });
  
});

console.log('Server listen in port '+port+'. Connect to localhost');
app.listen(port);