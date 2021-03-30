const request = require("request");
const express = require("express");
const keys = require("../config/keys");

const credentials = `${keys.twitterAPIKey}:${keys.twitterAPISecretKey}`;
const credentialsBase64Encoded = new Buffer(credentials).toString("base64");

var app = express();

app.get("/", function (req, res) {
  res.send(
    "code: " +
      req.query.code +
      "<br><br><button onclick='window.location.href=\"/token\"'>Get Token</button>"
  );
  code = req.query.code;
});

// redirect to twitter login
app.get("/connect", function (req, res) {
  request(
    {
      url:
        "https://api.twitter.com/oauth/authenticate?oauth_token=" +
        keys.twitterAccessToken,
      method: "POST",
      headers: {
        Authorization: `Basic ${credentialsBase64Encoded}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: "grant_type=client_credentials",
    },
    function (err, resp, body) {
      res.send(body);
    }
  );
});

// Obtain a bearer token
app.get("/token", function (req, res) {
  request(
    {
      url: "https://api.twitter.com/oauth2/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${credentialsBase64Encoded}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: "grant_type=client_credentials",
    },
    function (err, resp, body) {
      var obj = JSON.parse(body);
      var token = obj.access_token;
      res.send(token);
    }
  );
});

// login view
app.get("/login", function (req, res) {
  request(
    {
      url:
        "https://api.twitter.com/1.1/statuses/user_timeline.json?count=1&screen_name=twitterapi",
      headers: {
        Authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAAIBnOAEAAAAAWEVBIJVyzs%2F43h%2F7NbI55Oz2kI8%3DLDN3FCllZAb20Ll5tGPjSuPzYmIxxC3ymU2IWnlVbj1crlSpEj",
      },
    },
    function (error, response, body) {
      var obj = JSON.parse(body);
      res.send(obj);
    }
  );
});

app.listen(3000);

app.get("/connect", function (req, res) {
  request;
});
