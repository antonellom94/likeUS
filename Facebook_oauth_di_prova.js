const express = require('express');
const axios = require('axios').default;
const fs = require('fs')
require('dotenv').config(".env");

const STATE = "OauthMiFaSchifo"
const request_uri = 'https://www.facebook.com/v10.0/dialog/oauth?client_id='+process.env.APP_ID+'&redirect_uri=http://localhost:8888/page&state='+STATE

//creazione istanza express
const prova1 = express();

//Pagina principale da cui accedo a facebook, nella pagina c'è un bottone che fa una chiamata GET alla risorsa /login che reindirizza al login di FaceBook
prova1.get('/', (req, res) => {
    fs.readFile('main_page.html', {encoding:'utf-8'}, (err, data) => {
        res.send(data);
    })
});

//redirect della pagina al login di facebook, una volta fatto il login il browser automaticamente chiamma la GET http://localhost:8888/page
prova1.get('/login', (req, res) => {
    res.redirect(request_uri);
});

prova1.get('/page', (req, res) => {
    if(req.query.state === STATE){// il parametro state è semplicemente un altra forma di sicurezza aggiuntiva che sto usando male oltretutto: ignoratelo
        //Faccio la richiesta per il token passando come parametro il code che mi è stato passatto dal redirect
        axios.get('https://graph.facebook.com/v10.0/oauth/access_token?client_id='+process.env.APP_ID+
        '&client_secret='+process.env.SECRET+'&code='+req.query.code+
        '&redirect_uri='+request_uri)// il redirect_uri deve essere proprio il request_uri utilizzato nel passo precedente come redirect per permettere il login
        .then(risposta_dio => res.send('this is you\'re token: '+req.query.code))//tutto a buon fine, manda il token al browser
        .catch(err => console.log('errore: '+err));//c'è stato un errore stanpa l'errore
    }
    else{
        res.send("Autenticazione compromessa");
    }
})

//metto il server in ascolto
prova1.listen(8888)