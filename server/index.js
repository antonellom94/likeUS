const express = require("express");
const gooogleAuth = require('./auth/googleAuth');
const googleDrive = require('./api/drive');
const app = express();

// route homepage => '/'
app.get("/", function (req, res) {
  var googleButton = "<br>Press this to upload your image to <button onclick='window.location.href=\"/auth/google\"'>Drive</button>"; 
  res.send("This is the Homepage" + googleButton);
});

app.get('/auth/google', function(req, res) {
  gooogleAuth.GoogleAccess(req, res);  
});

app.get('/auth/google/callback', function(req, res) {
  var googleCode = req.query.code;
  gooogleAuth.GoogleToken(req, res, googleCode); 
});

app.post('/upload/googleDrive', function(req, res) {
  googleDrive.GoogleDrive('DeCocco', '../images/DeCocco.jpg', req, res);
});

const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Some-repo app is listening at http://%s:%s", host, port);
});