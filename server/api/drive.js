const fs = require('fs');
const request = require('request');

//Tramite il token viene usata l'api per caricare l'mmagine fileName in filePath sulla directory Root dell'account di Google Drive
function GoogleDrive(fileName, filePath, req, res){

    var a_t = fs.readFileSync('GoogleTokenInfo.json');

    var fileSize = fs.statSync(filePath).size;

    //Viene fatta la richiesta tramite il token per caricare un'immagine di nome fileName
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
        function(err, res){
          if (err) {
            console.log(err);
            return;
          }
      
          //Viene caricata l'immagine di fileSize da filePath
          request(
            {
                method: "PUT",
                url: res.headers.location,
                headers: { "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}` },
                body: fs.readFileSync(filePath)
            },
            function(err, res, body){
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
