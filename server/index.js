const express = require("express");
const gooogleAuth = require("./auth/googleAuth");
const googleApi = require("./api/googleApi");
const cookieParser = require("cookie-parser");
const passport = require("passport");

require("./passport/passport");
const app = express();

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

// route homepage => '/'
app.get("/", function (req, res) {
  const cookies = req.cookies;
  // sessione express
  //console.log(cookies["express:sess"]);

  //console.log("Signed cookies: " + req.signedCookies);

  var googleButton =
    "<br>Press this to upload your image to <button onclick='window.location.href=\"/auth/google\"'>Drive</button>";
  res.send("This is the Homepage" + googleButton);
});

/* ------------------ GOOGLE API START ----------------------- */

app.get("/auth/google", function (req, res) {
  gooogleAuth.GoogleAccess(req, res);
});

app.get("/auth/google/callback", function (req, res) {
  var googleCode = req.query.code;
  gooogleAuth.GoogleToken(req, res, googleCode);
});

app.post("/upload/googleDrive", function (req, res) {
  googleApi.GoogleDrive("DeCocco", "../images/DeCocco.jpg", req, res);
});

/* ------------------ GOOGLE API ENDS ----------------------- */

/* ------------------ TWITTER API START ----------------------- */

app.get("/auth/twitter/error", (req, res) => {
  res.send("An error has occurred");
});

app.get("/auth/twitter", passport.authenticate("twitter"), () => {
  console.log(passport.authenticate("twitter").profile);
});

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/auth/twitter/error",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/auth/twitter/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

/* ------------------ TWITTER API ENDS ----------------------- */

const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Some-repo app is listening at http://%s:%s", host, port);
});
