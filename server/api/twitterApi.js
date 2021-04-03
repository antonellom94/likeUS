const request = require("request");
const express = require("express");
const keys = require("../config/keys");

const credentials = `${keys.twitterAPIKey}:${keys.twitterAPISecretKey}`;
const credentialsBase64Encoded = new Buffer(credentials).toString("base64");

const oauth_callback = "http:localhost:3000/auth/twitter/callback";
const consumer_key = keys.twitterAPIKey;
const consumer_secret = keys.twitterAPISecretKey;
const oauth_token = keys.twitterAccessToken;
const oauth_secret = keys.twitterAccessSecret;
const bearer_token = keys.twitterAPIBearerToken;
const oauth_nonce = new Buffer(
  "jdiaosjfelmwnclsejo4j35kwnekfnrsek5j34543F"
).toString("base64");

var app = express();

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

// visualizza stato utente
app.get("/auth/twitter/show", function (req, res) {
  request(
    {
      url:
        "https://api.twitter.com/1.1/statuses/show.json?id=1116016340161134600",
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

// info user
app.get("/auth/twitter/api", function (req, res) {
  const screen_name = "@Totti";
  request(
    {
      url:
        "https://api.twitter.com/1.1/statuses/user_timeline.json?count=10&screen_name=" +
        screen_name,
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

// authorization
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

// users info
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
