const axios = require('axios').default
const fs = require('fs')
const keys = require('../config/keys')

const STATE = "OauthMiFaSchifo"

const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+
keys.APP_ID+'&redirect_uri=http://localhost:3000/get_img&state='+
STATE+"&scope=user_photos,user_posts"


const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );


module.exports.get_profile_picture = function(req,res){
    if(req.query.state === STATE){ // STATE è un parametro di check
        //Faccio la richiesta per il token passando come parametro il code che mi è stato passatto dal redirect
        axios.get('https://graph.facebook.com/v10.0/oauth/access_token?client_id='+keys.APP_ID+
        '&client_secret='+keys.SECRET+'&code='+req.query.code+
        '&redirect_uri='+request_uri)// Il redirect_uri deve essere proprio il request_uri utilizzato nel passo precedente come redirect per permettere il login
        .then(res_token => {
            return axios.get('https://graph.facebook.com/me/picture?height=200&width=200&redirect=0&access_token='+res_token.data.access_token) // API call to get profile image
        })
        .then(async profile_picture_res => {
            /*
            let buf = Buffer.from(profile_picture_res.data, 'utf-8')
            fs.writeFile('./prof.jpg', buf , ()=>{
                res.send("Immagine prelevata")
            })
           console.log(Buffer.from(profile_picture_res.data, 'binary'))
           */
          console.log(profile_picture_res.data.data.url)
            let example_image_1 = await download_image(profile_picture_res.data.data.url, 'example-1.jpg');
        })
        .catch(err => {console.log(err); res.send('Si è verificato un errore')});    // Se c'è stato un errore stanpa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
}

module.exports.facebook_auth = function(req, res){
    res.redirect(request_uri)
}
