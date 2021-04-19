const express = require('express')
const axios = require('axios').default
const keys = require('../config/keys')
const port = 3000
var cookieParser = require('cookie-parser')

const STATE = "OauthMiFaSchifo"

const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+
keys.APP_ID+'&redirect_uri=http://localhost:3000/page&state='+
STATE+"&scope=user_photos,user_posts"
var TESTER_TOKEN = "EAADZB9KGeMxEBAHvjjzkIRl6ZCu3WoK3JxQhjCeseum8Y3g0JIC5m9qHjBbsNaZAp2MhzSF1IZBZBZCN5uyAWkNnHTu50TW6oIZAzb07d260ZAMZAgzh7IVyZB7pv8sUctFjOUjtUDKg44EsUxeCI4L99v5Duf3SdZAxHPrQMfzpVa1s70uZAPMZCQ09HgQydtdAfpvIVgdmvAqbF7B6GMqjRmgrg"
var TOKEN = ""
//creazione istanza express
const prova1 = express()
prova1.use(cookieParser())


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
            res.cookie("Session", TOKEN );
            res.send('<a href="http://localhost:3000/get_posts"><button>ricevi informazioni sui post</button></a>'+
            '<a href="http://localhost:3000/get_photos"><button>ricevi informazioni sulle foto</button></a>'+
            '<a href="http://localhost:3000/post_something"><button>Click here to post something on facebook</button></a>')
        })//tutto a buon fine, manda il token al browser
        .catch(err => console.log('errore: '+err));//c'è stato un errore stanpa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
})

//pagina virtuale per utilizzare l'untente tester. NON FUNZIONA NEANCHE L'UTENTE TESTER
prova1.get('/page_bypass', (req, res) => {
    TOKEN = TESTER_TOKEN
    res.send('<a href="http://localhost:3000/get_posts"><button>ricevi informazioni sui post</button></a>'+
            '<a href="http://localhost:3000/get_photos"><button>ricevi informazioni sulle foto</button></a>'+
            '<a href="http://localhost:3000/post_something"><button>Click here to post something on facebook</button></a>')
})

//chiamata api posts
prova1.get('/get_posts', (req, res) => {
    axios.get('https://graph.facebook.com/me/feed?access_token='+req.cookies.Session)
    .then(api_res => {
        res.send(api_res.data)
    })
    .catch(err => {
        res.send(err.status)
    })
})
//chiamata api foto
prova1.get('/get_photos', (req, res) => {
    axios.get('https://graph.facebook.com/me/photos?access_token='+req.cookies.Session)
    .then(api_res => {
        res.send(api_res.data)
    })
    .catch(err => {
        res.send(err)
    })
})
// chiamata api per postare su facebook (Non funziona finchè non mi approvano l'app dio ***)
prova1.get('/post_something', (req, res) => {
    axios.post('https://graph.facebook.com/me/feed?message=This post was published by Nodejs&access_token='+req.cookies.Session)
    .then(risp => {
        res.send("Message correctly posted:"+risp.data)
    })
    .catch(err => {
        res.send(err)
    })
})
//metto il server in ascolto
prova1.listen(port)
