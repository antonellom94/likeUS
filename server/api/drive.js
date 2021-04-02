const fs = require('fs');
const request = require('request');

function GoogleDrive(fileName, filePath, req, res){

    var a_t = fs.readFileSync('GoogleTokenInfo.json');

    var fileSize = fs.statSync(filePath).size;

    
    fs.unlink('GoogleTokenInfo.json', function(err){
      console.log(err);
    });//Non serve più

    request(
        {
            method: "POST",
            url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
            headers: {
                Authorization: `Bearer ${a_t}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: fileName, mimeType: "image/jpeg" })
        },
        function(err, request_res){
          if (err) {
            console.log(err);
            return;
          }
      
          request(
            {
                method: "PUT",
                url: request_res.headers.location,
                headers: { "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}` },
                body: fs.readFileSync(filePath)
            },
            function(err, request_res, body){
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(body);
            }
          );
        }
      );
}

module.exports = { GoogleDrive };
