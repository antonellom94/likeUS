const request = require("request");
const express = require("express");
const keys = require("../config/keys");
const { OAuth } = require("oauth");

const credentials = `${keys.twitterAPIKey}:${keys.twitterAPISecretKey}`;
const credentialsBase64Encoded = new Buffer(credentials).toString("base64");

const oauth_callback = "http:localhost:3000/auth/twitter/callback";
const consumer_key = keys.twitterAPIKey;

var app = express();

app.get("/auth/twitter/oauth1", function (req, res) {
  request(
    {
      url: "https://api.twitter.com/oauth/request_token",
      method: "POST",
      headers: {
        oauth_callback: oauth_callback,
        oauth_consumer_key: keys.twitterAPIKey,
      },
    },
    function (error, response) {
      console.log(response.statusCode);
      res.send(response.body);
    }
  );
});

app.get("/auth/twitter/callback", function (req, res) {
  request(
    {
      url: "https://api.twitter.com/oauth2/token",
      method: "POST",
      headers: {
        authorization: "Basic " + credentialsBase64Encoded,
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "postman-token": "ad20d936-a9b9-2766-d5bb-e201f5a45884",
      },
      body: "grant_type=client_credentials",
    },
    function (error, response) {
      console.log(response.statusCode);
      res.send(JSON.parse(response.body));
    }
  );
});

app.get("/auth/twitter/show", function (req, res) {
  request(
    {
      url:
        "https://api.twitter.com/1.1/statuses/show.json?id=1359555091406213000",
      method: "GET",
      headers: {
        authorization: "Bearer " + keys.twitterAPIBearerToken,
      },
    },
    function (err, response) {
      console.log(response.statusCode);
      res.send(JSON.parse(response.body));
    }
  );
});

app.get("/auth/twitter/api", function (req, res) {
  request(
    {
      url:
        "https://api.twitter.com/1.1/statuses/user_timeline.json?count=10&screen_name=gianleo201",
      method: "GET",
      headers: {
        authorization: "Bearer " + keys.twitterAPIBearerToken,
      },
    },
    function (err, response) {
      console.log(response.statusCode);
      res.send(JSON.parse(response.body));
    }
  );
});

app.get("/auth/twitter", function (req, res) {
  request(
    {
      url: "https://api.twitter.com/oauth/authorize",
      method: "GET",
      headers: {
        oauth_token: keys.twitterAPIBearerToken,
      },
    },
    function (err, response) {
      console.log(response.statusCode);
      res.send(response.body);
    }
  );
});

app.get("/auth/twitter/users", function (req, res) {
  request(
    {
      url: "https://api.twitter.com/2/users?ids=2244994945,6253282",
      method: "GET",
      headers: {
        authorization: "Bearer " + keys.twitterAPIBearerToken,
      },
    },
    function (error, response) {
      console.log(JSON.parse(response.statusCode));
      res.send(JSON.parse(response.body));
    }
  );
});

app.listen(3000);
