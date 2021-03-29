var express = require('express');
const fs = require('fs');

const keys = require("../config/keys")

port = 3000;
client_id = keys.googleClientID;
client_secret = keys.googleClientSecret;
red_uri="http://localhost:3000/&response_type=code";

var app = express();
app.use(express.urlencoded({ extended: false }));

var urltoken = "https://accounts.google.com/o/oauth2/token";
var scope = "https://www.googleapis.com/auth/userinfo.email";
var getCode = "https://accounts.google.com/o/oauth2/auth?client_id="+client_id+"&scope="+scope+"&redirect_uri="+red_uri;

app.get('/login', function(req, res){
  var info = "Schermata iniziale per il login a Google";
  res.send(info + "<br><button onclick='window.location.href=\""+ getCode +"\"'>Log in</button>");
});

console.log('Server listen in port '+port+'. Connect to localhost');
app.listen(port);