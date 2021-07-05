const axios = require('axios').default
const fs = require('fs')
const keys = require('../config/keys')
const uuid = require('uuid')

const STATE = "Gino"

const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+
keys.APP_ID+'&redirect_uri=http://localhost/get_img&state='+
STATE+"&scope=user_photos,user_posts"


const download_image = (url, image_path) => {
  return new Promise( (ok_download, rej) => {
    axios({
      url,
      responseType: 'stream',
    })
    .then( response => {
        return new Promise((resolve, reject) => {
          response.data
            .pipe(fs.createWriteStream(image_path))
            .on('finish', () => resolve(image_path))
            .on('error', e => reject(e));
        });
    })
    .then(image_path => ok_download(image_path))
    .catch(err => rej(err));
  });
}

module.exports.get_profile_picture = function(req,res){
    if(req.query.state === STATE){ // STATE è un parametro di check
        //Faccio la richiesta per il token passando come parametro il code che mi è stato passatto dal redirect
        axios.get('https://graph.facebook.com/v10.0/oauth/access_token?client_id='+keys.APP_ID+
        '&client_secret='+keys.SECRET+'&code='+req.query.code+
        '&redirect_uri='+request_uri)// Il redirect_uri deve essere proprio il request_uri utilizzato nel passo precedente come redirect per permettere il login
        .then(res_token => {
            return axios.get('https://graph.facebook.com/me/picture?height=200&width=200&redirect=0&access_token='+res_token.data.access_token) // API call to get profile image
        })
        .then(profile_picture_res => {
          return download_image(profile_picture_res.data.data.url, './facebookImage/'+uuid.v4()+'.jpg' ); // image wil be saved in facebookImage folder
        })
        .then( pathzesco => {
          res.cookie("facebookPath", pathzesco).redirect("/home/logged.html");
        })
        .catch(err => {console.log(err); res.send('Si è verificato un errore')});    // Se c'è stato un errore stampa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
}

module.exports.facebook_auth = function(req, res){
  if(req.cookies.facebookPath !== undefined && fs.existsSync(req.cookies.facebookPath)){
    console.log("Cookie già presente, ridirezionare alla pagina secondaria");
    res.redirect("/home/logged.html");
  }
  else{
    console.log("Cookie non presente, necessario accesso");
    res.redirect(request_uri);
  }
}
