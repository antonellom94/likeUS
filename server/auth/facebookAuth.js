const express = require('express')
const axios = require('axios').default
const keys = require('../config/keys')
const port = 3000

const STATE = "OauthMiFaSchifo"
const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+keys.APP_ID+'&redirect_uri=http://localhost:3000/page&state='+STATE+'&scope=user_posts,user_photos'
var TOKEN = ""
//creazione istanza express
const prova1 = express()

//Pagina principale da cui accedo a facebook, nella pagina c'è un bottone che fa una chiamata GET alla risorsa /login che reindirizza al login di FaceBook
prova1.get('/', (req, res) => {
    res.send('<a href="http://localhost:3000/login"><button>Accedi a Facebook</button></a>')
});

//redirect della pagina al login di facebook, una volta fatto il login il browser automaticamente chiamma la GET http://localhost:3000/page
prova1.get('/login', (req, res) => {
    res.redirect(request_uri)
});

prova1.get('/page', (req, res) => {
    if(req.query.state === STATE){// il parametro state è semplicemente un altra forma di sicurezza aggiuntiva che sto usando male oltretutto: ignoratelo
        //Faccio la richiesta per il token passando come parametro il code che mi è stato passatto dal redirect
        axios.get('https://graph.facebook.com/v10.0/oauth/access_token?client_id='+keys.APP_ID+
        '&client_secret='+keys.SECRET+'&code='+req.query.code+
        '&redirect_uri='+request_uri)// il redirect_uri deve essere proprio il request_uri utilizzato nel passo precedente come redirect per permettere il login
        .then(risposta_dio =>{
            TOKEN = risposta_dio.data.access_token
            res.send('<a href="http://localhost:3000/get_posts"><button>ricevi informazioni sui post</button></a><a href="http://localhost:3000/get_photos"><button>ricevi informazioni sulle foto</button></a>')
        })//tutto a buon fine, manda il token al browser
        .catch(err => console.log('errore: '+err));//c'è stato un errore stanpa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
})
//chiamata api posts
prova1.get('/get_posts', (req, res) => {
    axios.get('https://graph.facebook.com/me/feed?access_token='+TOKEN)
    .then(api_res => {
        res.send(api_res.data)
    })
    .catch(err => {
        res.send(err)
    })
})
//chiamata api foto
prova1.get('/get_photos', (req, res) => {
    axios.get('https://graph.facebook.com/me/photos?access_token='+TOKEN)
    .then(api_res => {
        res.send(api_res.data)
    })
    .catch(err => {
        res.send(err)
    })
})
//metto il server in ascolto
prova1.listen(port)
