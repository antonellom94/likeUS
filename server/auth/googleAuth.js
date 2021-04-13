var express = require('express');
var request = require('request');
const keys = require("../config/keys")

var app = express();
app.use(express.urlencoded({ extended: false }));

client_id = keys.googleClientID;
client_secret = keys.googleClientSecret;
code = "";
var a_t = '';

red_uri = "http://localhost:3000/auth/google/callback";
var scope = "https://www.googleapis.com/auth/drive.file";
var googleToken = "https://accounts.google.com/o/oauth2/token";
var getCode = "https://accounts.google.com/o/oauth2/auth?client_id="+client_id+"&scope="+scope+"&approval_prompt=force&response_type=code&redirect_uri="+red_uri;

//Si chiede l'accesso all'account Google dell'utente eseguendo inoltre la richiesta dei consensi per poter procedere
function GoogleAccess(req, res){
  if(a_t === '')
    res.redirect(getCode);
  else{
    res.send("Uploading...<br>Meanwhile, return to the <button onclick='window.location.href=\"/\"'>homepage</button>");
    request.post("http://localhost:3000/upload/googleDrive");
  }

}

//Viene richiesto il token, il quale verrà scritto in un file per poter essere letto dalle api
function GoogleToken(req, res, code){

  var getToken = googleToken+"?code="+code+"&client_id="+client_id+"&client_secret="+client_secret+"&grant_type=authorization_code&redirect_uri="+red_uri;
  
  request.post(getToken, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!\nServer responded with:', body);
    var info = JSON.parse(body);
    a_t = info.access_token;
    res.send("Uploading...<br>Meanwhile, return to the <button onclick='window.location.href=\"/\"'>homepage</button>");
    request.post("http://localhost:3000/upload/googleDrive");
  });
}

function getToken() {
  return a_t;
}
module.exports = { GoogleAccess, GoogleToken, getToken };