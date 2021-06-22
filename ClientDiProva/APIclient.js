// launch this script with the following sintax:
// node APIclient.js <first_image_name> <second_image_name> <result_image_name>
// where first_image and second_image are located in ImagesToSend directory


const http = require('http')
const fs = require("fs")

// check wheter script call is correct
if(process.argv[2] === undefined || process.argv[3] === undefined || process.argv[4] === undefined || process.argv.length > 5 ){
    console.log("Wrong arguments, this script must be called like this: \nnode index.js <first_image_name> <second_image_name> <result_image_name>")
    process.exit(0);
}

function base64_encode(file) {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
}
const firstImage = base64_encode("./imagesToSend/"+process.argv[2]);
const secondImage = base64_encode("./imagesToSend/"+process.argv[3]);

const data = JSON.stringify({
    first: firstImage,
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
            fs.writeFileSync(process.argv[4], jdata.result, 'base64');
    });

})

req.on('error', error => {
    console.error(error)
})

req.write(data)
req.end()



