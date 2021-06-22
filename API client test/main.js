const axios = require("axios").default;
const fs = require('fs');


axios.post("localhost/faceRec", {first: fs.readFileSync("./bruce.jpg", "binary"), second: fs.readFileSync("./tom.jpg","binary")})
.then(resp => {
    fs.writeFileSync("./result.jpg",resp.data.result, {encoding: "binary"});
});