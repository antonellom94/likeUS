const axios = require('axios').default
const keys = require('../config/keys')

const STATE = "OauthMiFaSchifo"

const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+
keys.APP_ID+'&redirect_uri=http://localhost:3000/home&state='+
STATE+"&scope=user_photos,user_posts"

/*
prova1.get('/page', (req, res) => {
    if(req.query.state === STATE){// il parametro state è semplicemente un altra forma di sicurezza aggiuntiva che sto usando male oltretutto: ignoratelo
        //Faccio la richiesta per il token passando come parametro il code che mi è stato passatto dal redirect
        axios.get('https://graph.facebook.com/v10.0/oauth/access_token?client_id='+keys.APP_ID+
        '&client_secret='+keys.SECRET+'&code='+req.query.code+
        '&redirect_uri='+request_uri)// il redirect_uri deve essere proprio il request_uri utilizzato nel passo precedente come redirect per permettere il login
        .then(risposta_dio =>{
            TOKEN = risposta_dio.data.access_token
            
            res.send('<a href="http://localhost:3000/get_profile_picture"><button>ricevi informazioni sulle foto</button></a>')
        })//tutto a buon fine, manda il token al browser
        .catch(err => console.log('errore: '+err));//c'è stato un errore stanpa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
})
*/
module.exports.get_profile_picture = function(req,res){
    axios.get('https://graph.facebook.com/me/picture?height=200&width=200&redirect=0&access_token='+TOKEN)
    .then(api_res => {
        res.redirect(api_res.data.data.url)
    })
    .catch(err => {
        res.send(err)
    })
}

module.exports.facebook_auth = function(req, res){
    res.redirect(request_uri)
}
