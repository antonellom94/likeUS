const express = require("express");
const app = express();

// route HomePage => '/'
app.get("/", function (req, res) {
  res.send("This is the Homepage");
});

const server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
