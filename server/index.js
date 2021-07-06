const express = require("express");
const request = require("request");
const session = require("express-session");
const googleAuth = require("./auth/googleAuth");
const googleApi = require("./api/googleApi");
const Facebook_auth_and_apis = require("./auth/facebookAuth");
const passport = require("passport");
const websocket = require("ws");
const keys = require("./config/keys");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const uuid = require("uuid");
const isbase64 = require("is-base64");

/*const Twitter = require("twitter");

// spostare logica e richiamare solamente nell'index
const client = new Twitter({
  consumer_key: keys.twitterAPIKey,
  consumer_secret: keys.twitterAPISecretKey,
  access_token_key: keys.twitterAccessToken,
  access_token_secret: keys.twitterAccessSecret,
});

const imageData = fs.readFileSync(document.cookie.ImagePath);

client.post(
  "media/upload",
  { media: imageData },
  function (error, media, response) {
    if (error) {
      console.log(error);
    } else {
      const status = {
        status: "I tweeted from LikeUS!",
        media_ids: media.media_id_string,
      };

      client.post("statuses/update", status, function (error, tweet, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Successfully tweeted an image!");
        }
      });
    }
  }
);
*/
require("./passport/passport");
const app = express();

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));

app.use(express.json({ limit: "200mb" }));

// API
app.post("/faceRec", (req, res) => {
  // Request must contain a JSON body with 2 base64 encoded string representing the images
  mex = req.body;
  if (
    Object.keys(mex).length === 0 ||
    mex.first === undefined ||
    mex.second === undefined ||
    !isbase64(mex.first, { paddingRequired: true }) ||
    !isbase64(mex.second, { paddingRequired: true })
  ) {
    res.status(400).send();
  } else {
    mex.processing = true;
    let corrID = uuid.v4();
    rabbitMQ_channel.sendToQueue(
      "rpcAPI_queue",
      Buffer.from(JSON.stringify(mex)),
      { replyTo: response_queue, correlationId: corrID }
    );

    let APIresp = (msg) => {
      res.status(200).type("application/json").send(msg);
    };

    bridge.once(corrID, APIresp);
    setTimeout(() => {
      bridge.off(corrID, APIresp);
      res.status(500).send();
    }, 1000 * 60 * 5);
  }
});

//
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
  console.log("questo è il cookie" + cookies);
  console.log(Date.now());

  //Controllo se in questa sessione sia stato eseguito almeno una volta il FaceRec
  if (cookies.ImagePath && fs.existsSync(cookies.ImagePath)) {
    var googleButton =
      "<br>Press this to upload your image to <button onclick='window.location.href=\"/auth/google\"'>Drive</button>";

    //Controllo se è già presente un token di google, in caso controllo la scadenza
    if (cookies.googleToken)
      if (cookies.googleToken.expire_time > Date.now())
        googleButton =
          "<br>You're already logged with google!" +
          "<br>If you want, you can <button onclick='window.location.href=\"/logout/google\"'>logout</button> and try with another google account!" +
          "<br>Try your upload on <button onclick='window.location.href=\"/upload\"'>Drive</button>";
    /*
    var twitterButton =
      "<br>You can share also to <button onclick='window.location.href=\"/share/twitter\"'>Twitter</button>";*/
    res.send(
      "This is the sharing page" +
        googleButton +
        "<br>You can return to the homepage <button onclick='window.location.href=\"/home/\"'>here</button>"
    );
  } else {
    res.send(
      "Nothing to do here, but you can go <button onclick='window.location.href=\"/home\"'>here</button>"
    );
  }
});

app.post("/share", function (req, res) {
  console.log(req.body);
  res.cookie("ImagePath", "./resultImage/" + req.body.id + ".jpg");
  res.redirect("/");
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
  //Ogni ora i file vengono eliminati, quindi bisogna controllare
  if (!fs.existsSync(cookies.ImagePath)) {
    res.clearCookie("ImagePath");
    res.send(
      "Your file expired! <br>Come back to <button onclick='window.location.href=\"/home/\"'>here</button>"
    );
  }
  //Controllo di nuovo se il token è scaduto per evitare problemi
  else if (cookies.googleToken.expire_time < Date.now())
    res.send(
      "Your token expired!<br>You can, return to the <button onclick='window.location.href=\"/\"'>sharing page</button>" +
        " or you can try to <button onclick='window.location.href=\"/auth/google\"'>login</button>"
    );
  else {
    res.send(
      "Uploading...<br>Meanwhile, return to the <button onclick='window.location.href=\"/home/\"'>homepage</button>" +
        " or to the <button onclick='window.location.href=\"/\"'>sharing page</button>"
    );
    var a_t = req.cookies.googleToken.token;
    var imPath = req.cookies.ImagePath;

    request(
      {
        url: "http://localhost:3000/upload/googleDrive",
        method: "POST",
        json: { token: a_t, ImPath: imPath },
      },
      function (error, response, body) {
        console.log(body);
      }
    );
  }
});

app.post("/upload/googleDrive", function (req, res) {
  googleApi.GoogleDrive("YourResult", req.body.ImPath, req.body.token);
});

app.get("/logout/google", function (req, res) {
  //Per effettuare un logout cancello il token di google
  res.clearCookie("googleToken");
  res.redirect("/");
});

/* ------------------ GOOGLE API ENDS ----------------------- */

/* ------------------ TWITTER API START ----------------------- */
/*
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

app.post("/share/twitter", (req, res) => {
  cookie = req.cookies;
  const image = fs.readFileSync("../ClientDiProva/imagesToSend/keanu.jpg");
  tweet(image);
  res.send("tweeted with success");
});
*/
/* ------------------ TWITTER API ENDS ----------------------- */

/* --------------------- FACEBOOK API START ------------------ */

app.get("/auth/facebook", (req, res) => {
  Facebook_auth_and_apis.facebook_auth(req, res);
});

app.get("/get_img", (req, res) => {
  console.log("prelevo l'mmagine profilo");
  Facebook_auth_and_apis.get_profile_picture(req, res);
});

app.get("/f_log_out", (req, res) => {
  res.clearCookie("facebookPath");
  res.redirect("/home/");
});

/* --------------------- FACEBOOK API ENDS ----------------- */

/*---------------------- BRIDGE WS AMQP ------------------- */
const EventEmitter = require("events");
const bridge = new EventEmitter();

/*--------------------- WEBSOCKET -------------------------*/

//Web socket handling
const server = require("http").createServer(app);
const wss = new websocket.Server({ server: server });
wss.on("connection", (ws) => {
  ws.counter = 0;
  ws.id = uuid.v4();
  ws.send(JSON.stringify({ message: "scrivi /help per ottenere info" }));
  ws.on("message", (data) => {
    let mex = JSON.parse(data);
    // Incoming messages for processing images
    if (
      mex.processing !== undefined &&
      mex.processing === true &&
      mex.first !== undefined &&
      mex.second !== undefined
    ) {
      console.log("recieved request");
      if (mex.logged !== undefined && mex.logged === true) {
        mex.first = fs.readFileSync(mex.first, "binary");
        rabbitMQ_channel.sendToQueue(
          "rpc_queue",
          Buffer.from(JSON.stringify(mex)),
          { replyTo: response_queue, correlationId: ws.id }
        );
      } else {
        rabbitMQ_channel.sendToQueue("rpc_queue", Buffer.from(data), {
          replyTo: response_queue,
          correlationId: ws.id,
        });
      }
      console.log("forwarded request to broker");
      // Backward response to client
      bridge.once(ws.id, (msg) => {
        console.log("Response recieved");
        let resultIm = JSON.parse(msg);
        if (resultIm.result !== "There are no recognizable faces") {
          let Path = "./resultImage/" + ws.id + ".jpg";
          console.log(Path);
          fs.writeFileSync(Path, resultIm.result, "binary");
        }
        ws.send(msg);
        console.log("response backwarded to client");
      });
    } else {
      if (mex.ok === undefined && mex.message !== undefined) {
        wss.clients.forEach((web_sock) => {
          if (web_sock !== ws) web_sock.send(data);
        });
        console.log(mex.message);
        if (mex.message.trim() === "/help") {
          let info_mex =
            "Benvenuti in Like-Us.\n completa il form scegliendo le immagini dal tuo pc, oppure loggati su facebook per utilizzare la tua immagine profilo e scoprire con chi/cosa somigli !!";
          let info = { message: info_mex };
          wss.clients.forEach((web_sock) => {
            web_sock.send(JSON.stringify(info));
          });
        }
      }
    }
  });
  ws.on("error", () => {
    console.log("A client disconnected before recieving response");
  });
});

/*------------------------ AMQP -------------------------*/

var amqp = require("amqplib/callback_api");
var response_queue = null;
var rabbitMQ_channel = null;
// Set up connection with rabbitMQ broker
var connectToBroker = async () => {
  return new Promise((resolve, reject) => {
    // connection setup client side
    amqp.connect("amqp://rabbitmq", function (error0, connection) {
      if (error0) {
        reject(error0);
        return;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        } else {
          rabbitMQ_channel = channel;
        }
        channel.assertQueue(
          "",
          {
            exclusive: true,
          },
          function (error2, q) {
            if (error2) {
              throw error2;
            } else {
              response_queue = q.queue;
            }
            channel.consume(q.queue, (msg) => {
              // trigger function set before in order to backward to client
              bridge.emit(msg.properties.correlationId, msg.content.toString());
            });
          }
        );
      });
      resolve();
    });
  });
};

// wait for the broker which is starting up

var pollConnectionAtStartUp = async () => {
  while (true) {
    try {
      await connectToBroker();
      console.log("Connected to broker");
      break;
    } catch (err) {
      await async function () {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 8000);
        });
      };
    }
  }
};

pollConnectionAtStartUp();

server.listen(3000, () => {
  console.log("server reachable at port 3000");
});

// enable graceful stop

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  wss.close();
  server.close();
  process.exit(0);
});

/****************SERVER CLEANING***************/

function CleanServer(cleanDir, timeToExpire) {
  console.log("Cleaning the " + cleanDir + " directory...");
  fs.readdir(cleanDir, function (err, files) {
    files.forEach(function (file, index) {
      console.log(file);
      fs.stat(path.join(cleanDir, file), function (err, stat) {
        if (stat.mtimeMs + timeToExpire < Date.now()) {
          console.log("Deleting: " + file);
          fs.unlinkSync(path.join(cleanDir, file));
        }
      });
    });
  });
}

//Ogni 10 minuti elimina i file presenti in ./resultImage modificati da più di un'ora
setInterval(CleanServer, 1000 * 60 * 10, "./resultImage", 1000 * 60 * 60);
setInterval(CleanServer, 1000 * 60 * 10, "./facebookImage", 1000 * 60 * 60);
