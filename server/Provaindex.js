const express = require("express");
const fs = require('fs');
const gooogleAuth = require('./auth/Prova');
const app = express();

// route homepage => '/'
app.get("/", function (req, res) {
  var googleButton = "<br>Press this to login to <button onclick='window.location.href=\"/auth/google\"'>Google</button>"; 
  res.send("This is the Homepage" + googleButton);
});

app.get('/auth/google', function(req, res) {
  gooogleAuth.GoogleAccess(req, res);  
});

app.get('/auth/google/callback', function(req, res) {
  var googleCode = req.query.code;
  gooogleAuth.GoogleToken(req, res, googleCode); 
});

app.get('/auth/google/api', function(req, res){
  let body = fs.readFileSync('GoogleInfo.json');
  var info = JSON.parse(body);
  res.send(info.items[2].timeZone);  
});

const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Some-repo app is listening at http://%s:%s", host, port);
});