const express = require("express");
const request = require("request");
const session = require("express-session");
const googleAuth = require("./auth/googleAuth");
const googleApi = require("./api/googleApi");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const websocket = require("ws");
const keys = require("./config/keys");
const path = require("path");
const {spawn} = require('child_process');
const fr = require("./FaceRec.js");
const fs = require("fs");
var formidable = require('formidable');

require("./passport/passport");
const app = express();

// app.use("/home", express.static(path.join(__dirname, "..", "client")));
// static middleware auto sets this routes 
app.get('/home', (req, res)=>{
  res.type('text/html')
  res.send(require('fs').readFileSync('../client/index.html', {encoding: 'utf-8'}))
})
app.get('/assets/script/index.js', (req, res)=>{
  res.type('application/javascript');
  res.send(require('fs').readFileSync('../client/assets/script/index.js', {encoding: 'utf-8'}))
})
app.get('/assets/style/index.css', (req,res)=>{
  res.type('text/css')
  res.send(require('fs').readFileSync('../client/assets/style/index.css', {encoding: 'utf-8'}))
})


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
  googleApi.GoogleDrive("DeCocco", path.join(__dirname, '/images/DeCocco.jpg'), req, res);
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

/*--------------------- WEBSOCKET -------------------------*/

// Colors for multicolor button
let colors = ["blue", "red", "green", "violet", "yellow", "orange", "brown"];
//Web socket handling
const server = require("http").createServer(app);
const wss = new websocket.Server({ server: server });
wss.on("connection", (ws) => {
  ws.counter = 0;
  ws.on("message", (data) => {
    let mex = JSON.parse(data);
    if (mex.ok === true) {
      //Send color
      ws.send(JSON.stringify({ color: colors[ws.counter % colors.length] }));
      ws.counter++;
      // set repetitive sendigs
      ws.streaming = setInterval(() => {
        ws.send(JSON.stringify({ color: colors[ws.counter % colors.length] }));
        ws.counter++;
      }, 500);
    }
    if (mex.ok === false) {
      // clear previous settings
      clearInterval(ws.streaming);
    } else if (mex.ok === undefined && mex.message !== undefined) {
      let text_to_broadcast = mex.message;
      wss.clients.forEach((web_sock) => {
        if (web_sock !== ws) web_sock.send(data);
      });
    }
  });
});


/*------------------------FaceRec Script----------------------*/

app.post("/FaceRec", function(req, res){
  var form = new formidable.IncomingForm();
  var newpathFirst;
  var newpathSecond;
  form.parse(req, function (err, fields, files) {
    var oldpath = files.First.path;
    newpathFirst = path.join(__dirname, '/images/') + files.First.name;
    fs.rename(oldpath, newpathFirst, function (err) {
      if (err) throw err;
    });
    oldpath = files.Second.path;
    newpathSecond = path.join(__dirname, '/images/') + files.Second.name;
    fs.rename(oldpath, newpathSecond, function (err) {
      if (err) throw err;
    });

    fr.FaceRec(newpathFirst, newpathSecond)
      .then((result) => {
        fs.unlinkSync(newpathFirst);
        fs.unlinkSync(newpathSecond);
        console.log("Finito!");
      }).catch((err) => {
        console.log(err);
      });
    
  });
  

  res.redirect('/');
});

server.listen(3000, () => {
  console.log("server reachable at port 3000");
});
