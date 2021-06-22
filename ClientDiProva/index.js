const http = require('http')
const fs = require("fs")

function base64_encode(file) {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
}
const firstImage = base64_encode("./imagesToSend/First.jpg");
const secondImage = base64_encode("./imagesToSend/Second.jpg");

const data = JSON.stringify({
    first: "UHJvdmE=",
    second: secondImage
})

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/faceRec',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}
    
const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    let data = '';

    res.on('data', (d) => {
        data += d;

    });

    res.on('end', () => {
        let jdata = JSON.parse(data);
        if(jdata.result === "There are no recognizable faces")
            console.log(jdata.result);
        else
            fs.writeFileSync("./res.jpg", jdata.result, 'base64');
    });

})

req.on('error', error => {
    console.error(error)
})

req.write(data)
req.end()



