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
const fr = require("./FaceRec.js");
const fs = require("fs");
var formidable = require("formidable");

require("./passport/passport");
const app = express();

// app.use("/home", express.static(path.join(__dirname, "..", "client")));
// static middleware auto sets this routes
app.use("/home", express.static(path.join(__dirname, "..", "client")));

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
  console.log(Date.now());
  //console.log(cookies["express:sess"]);
  console.log(req.session.cookie);

  //Controllo se in questa sessione sia stato eseguito almeno una volta il FaceRec
  if(cookies.ImagePath){
    var googleButton =
      "<br>Press this to upload your image to <button onclick='window.location.href=\"/auth/google\"'>Drive</button>";

    //Controllo se è già presente un token di google, in caso controllo la scadenza
    if (cookies.googleToken)
      if (cookies.googleToken.expire_time > Date.now())
        googleButton =
          "<br>You're already logged with google!" +
          "<br>If you want, you can <button onclick='window.location.href=\"/logout/google\"'>logout</button> and try with another google account!" +
          "<br>Try your upload on <button onclick='window.location.href=\"/upload\"'>Drive</button>";

    var twitterButton =
      "<button onclick='window.location.href=\"/auth/twitter\"'>Login</button>";
    res.send("This is the Homepage" + googleButton + twitterButton);
  } else {
    res.send("Nothing to do here, but you can go <button onclick='window.location.href=\"/home\"'>here</button>");
  }
});

//In teoria dovrebbe fare da waiting room, ma ancora non va del tutto
app.get("/waiting", function (req, res) {
  res.sendFile(path.resolve(__dirname + "/../client/waiting.html"));
});

/* ------------------ GOOGLE API START ----------------------- */

app.get("/auth/google", function (req, res) {
  googleAuth.GoogleAccess(req, res);
});

app.get("/auth/google/callback", function (req, res) {

  //Il codice per richiedere il token viene passato nell'url
  var googleCode = req.query.code;
  googleAuth.GoogleToken(req, res, googleCode);
});

app.get("/upload", function (req, res) {
  var cookies = req.cookies;

  //Controllo di nuovo se il token è scaduto per evitare problemi
  if (cookies.googleToken.expire_time < Date.now())
    res.send(
      "Your token expired!<br>You can, return to the <button onclick='window.location.href=\"/\"'>homepage</button>" +
        " or you can try to <button onclick='window.location.href=\"/auth/google\"'>login</button>"
    );
  else {
    res.send(
      "Uploading...<br>Meanwhile, return to the <button onclick='window.location.href=\"/\"'>homepage</button>"
    );
    var a_t = req.cookies.googleToken.token;
    var imPath = req.cookies.ImagePath;

    //Essendo una post non risultano i cookie, quindi li passo tramite url
    request.post("http://localhost:3000/upload/googleDrive?a_t=" + a_t+ "&imPath=" + imPath);
  }
});

app.post("/upload/googleDrive", function (req, res) {
  var imPath = req.query.imPath;
  googleApi.GoogleDrive("YourResult", imPath, req, res);
});

app.get("/logout/google", function (req, res) {

  //Per effettuare un logout cancello il token di google
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

/*------------------------FACEREC------------------------*/

app.post("/FaceRec", function (req, res) {
  var form = new formidable.IncomingForm();

  //Tramite la form.parse posso utilizzare il form inviato dall'index
  form.parse(req, function (err, fields, files) {

    //Prelevo le immagini dal form tramite files.Nome.path e le salvo sul server
    var oldpath = files.First.path;
    var FirstName = files.First.name;
    var newpathFirst = path.join(__dirname, "/images/") + FirstName;
    fs.rename(oldpath, newpathFirst, function (err) {
      if (err) throw err;
    });
    oldpath = files.Second.path;
    var SecondName = files.Second.name;
    var newpathSecond = path.join(__dirname, "/images/") + SecondName;
    fs.rename(oldpath, newpathSecond, function (err) {
      if (err) throw err;
    });

    //Per il path dell'immagine risultante unisco i nomi delle due inserite e un numero tra 1000 e 9999 per cercare unicità
    FinalName = (Math.floor(Math.random() * (9999 - 1000) + 1000)).toString() + path.parse(FirstName).name + SecondName;
    FinalPath = path.join(__dirname, "/images/") + FinalName;

    //Per il FaceRec passo le due immagini di base e il path del risultato, una volta finito elimino le vecchie immagine e imposto il cookie
    fr.FaceRec(newpathFirst, newpathSecond, FinalPath)
      .then((result) => {
        fs.unlinkSync(newpathFirst);
        fs.unlinkSync(newpathSecond);
        console.log("Finito!");

        //Il path lo inserisco nei cookie per facilitare, se un cookie è già presente, elimino l'immagine precedente riducendo il carico
        var cook = req.cookies['ImagePath'];
        if(cook){
          console.log("Deleting: " + cook);
          fs.unlinkSync(cook);
        }
        res.cookie("ImagePath", FinalPath); 
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

/*-----------------CLEAR SERVER----------------- */

//Per evitare di intasare il server, eseguo ogni tot. di tempo una pulizia dalle immagini considerate vecchie
//In questo caso elimino ogni 10 minuti le immagini che non vengono modificate da più di un'oras
function Remove(){
  var imPath = path.join(__dirname,'/images');

  //Controllo tutti i files all'interno della cartella delle immagini
  fs.readdir(imPath, (err, files) => {
    files.forEach(file => {
      var thisimage = path.join(imPath, file);

      //Per ogni file controllo i suoi attributi, in questo caso serve la data dell'ultima modifica
      fs.stat(thisimage, (err, stats) => {
        if(err) {
            throw err;
        }
        let milliseconds = (new Date().getTime() - stats.mtime);

        //Se il file è da considerare vecchio, lo elimino
        if(milliseconds > 60*60*1000){
          console.log("Older than one hour, deleting..."); 
          fs.unlinkSync(thisimage);
        }
      });      
    });
  });
}

//Ripeto la pulizia della cartella ogni tot. millisecondi
setInterval(Remove, 10*60*1000);


server.listen(3000, () => {
  console.log("server reachable at port 3000");
});
