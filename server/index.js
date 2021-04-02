const express = require("express");

const app = express();

// route homepage => '/'
app.get("/", (req, res) => {
  res.send("this is the homepage");
});

const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Some-repo app is listening at http://%s:%s", host, port);
});
