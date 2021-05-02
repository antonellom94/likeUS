const express = require("express");
const request = require("request");
const session = require("express-session");
const googleAuth = require("./auth/googleAuth");
const googleApi = require("./api/googleApi");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys");

require("./passport/passport");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);

app.use(
  session({
    secret: "sttringarandomica",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// route homepage => '/'
app.get("/", function (req, res) {
  var cookies = req.cookies;
  console.log(cookies);
  //console.log(cookies["express:sess"]);
  console.log(req.session.cookie);
  //console.log("Signed cookies: " + req.signedCookies);
  var googleButton =
    "<br>Press this to upload your image to <button onclick='window.location.href=\"/auth/google\"'>Drive</button>";
  if (cookies.googleToken)
    if (cookies.googleToken.expire_time < Date.now())
      googleButton =
        "<br>You're already logged with google!" +
        "<br>If you want, you can <button onclick='window.location.href=\"/logout/google\"'>logout</button> and try with another google account!" +
        "<br>Try your upload on <button onclick='window.location.href=\"/upload\"'>Drive</button>";

  var twitterButton =
    "<button onclick='window.location.href=\"/auth/twitter\"'>Login</button>";
  res.send("This is the Homepage" + googleButton + twitterButton);
});

/* ------------------ GOOGLE API START ----------------------- */

app.get("/auth/google", function (req, res) {
  googleAuth.GoogleAccess(req, res);
});

app.get("/auth/google/callback", function (req, res) {
  var googleCode = req.query.code;
  googleAuth.GoogleToken(req, res, googleCode);
});

app.get("/upload", function (req, res) {
  var cookies = req.cookies;
  if (cookies.googleToken.expire_time > Date.now())
    res.send(
      "Your token expired!<br>You can, return to the <button onclick='window.location.href=\"/\"'>homepage</button>" +
        +" or you can try to <button onclick='window.location.href=\"/auth/google\"'>login</button>"
    );
  else {
    res.send(
      "Uploading...<br>Meanwhile, return to the <button onclick='window.location.href=\"/\"'>homepage</button>"
    );
    var a_t = req.cookies.googleToken.token;
    request.post("http://localhost:3000/upload/googleDrive?a_t=" + a_t);
  }
});

app.post("/upload/googleDrive", function (req, res) {
  googleApi.GoogleDrive("DeCocco", "../images/DeCocco.jpg", req, res);
});

app.get("/logout/google", function (req, res) {
  res.clearCookie("googleToken");
  res.redirect("/");
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
    console.log("The user is logged in " + req.user.username);
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
