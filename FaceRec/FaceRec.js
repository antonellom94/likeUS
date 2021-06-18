const faceapi = require('face-api.js');
const canvas = require('canvas');
const sizeOf = require('image-size');
const fs = require('fs');
const ws = require('ws');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = `${__dirname}/models/`;

async function FaceRec(firstSource, secondSource){

  //Carico i modelli di faceapi utili per lo scopo
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  
  //L'immagine deve essere del tipo HTMLImageElement, quindi effettuo queste istruzioni per "convertirla" in un formato accettato
  const firstImage = await canvas.loadImage(firstSource);
  const firstSize = sizeOf(firstSource);
  const firstWidth = firstSize.width;
  const firstHeight = firstSize.height;
  const firstImg = canvas.createCanvas(firstWidth, firstHeight);
  const firstCtx = firstImg.getContext('2d');
  firstCtx.drawImage(firstImage, 0, 0, firstWidth, firstHeight);

  const secondImage = await canvas.loadImage(secondSource);
  const secondSize = sizeOf(secondSource);
  const secondWidth = secondSize.width;
  const secondHeight = secondSize.height;  
  const secondImg = canvas.createCanvas(secondWidth, secondHeight);
  const secondCtx = secondImg.getContext('2d');
  secondCtx.drawImage(secondImage, 0, 0, secondWidth, secondHeight);    
  
  //Trova la faccia più riconoscibile nell'immagine e ne trova il descrittore completo
  const firstFullDescr = await faceapi.detectSingleFace(firstImg).withFaceLandmarks().withFaceDescriptor();
  const secondFullDescr = await faceapi.detectSingleFace(secondImg).withFaceLandmarks().withFaceDescriptor();
  
  //Estrae il descrittore (array di 128 float32) dal descrittore completo
  const firstDescr = firstFullDescr.descriptor;
  const secondDescr = secondFullDescr.descriptor;

  //Calcola tramite la distanza euclidea il grado in percentuale di somiglianza dei volti
  const dist = ((1 - faceapi.euclideanDistance(firstDescr, secondDescr))*100).toFixed(2);
  console.log(dist);  
 
  //Calcolo le dimensioni dell'immagine finale
  const secondWidth_afterResize = (secondWidth/secondHeight) * firstHeight;
  const finalImg = canvas.createCanvas(firstWidth + secondWidth_afterResize, firstHeight);
  const finalCtx = finalImg.getContext('2d');
  finalCtx.drawImage(firstImage, 0, 0, firstWidth, firstHeight);
  //La versione estesa del drawImage consente di impostare posizione e dimensione finale dell'immagine da disegnare nel canvas
  finalCtx.drawImage(secondImage, 0, 0, secondWidth, secondHeight, firstWidth, 0, secondWidth_afterResize, firstHeight);
  //Nel font va indicata la grandezza, per questo concateno la grandezza voluta con px nomefont
  const mySize = firstHeight/5;
  const myFont = "px Georgia";
  finalCtx.font = mySize + myFont;
  finalCtx.fillStyle = "white";
  finalCtx.textAlign = "center";
  finalCtx.fillText(dist + "%", firstWidth, firstHeight * 9/10);
  const buffer = finalImg.toBuffer('image/png');
  return buffer.toString('binary');

/*
console.log("finito");
  const buffer = firstImg.toBuffer('image/png');
  return buffer.toString('binary');*/
}

// Web socket connesso all'application server
const web_sock = new ws("ws://localhost:3000/")
web_sock.on("open", () => {
    web_sock.send(JSON.stringify({auth: "FaceRec"}));
    console.log("Connected to application server");
})
web_sock.on("message", data => {
  let mex = JSON.parse(data);
  // process data ...
  if(mex.first !== undefined && mex.second !== undefined && mex.corrID !== undefined){
    let firstPath = "./"+mex.corrID+"first.jpg";
    let secondPath = "./"+mex.corrID+"second.jpg";
    fs.writeFileSync(firstPath, mex.first, 'binary');
    fs.writeFileSync(secondPath, mex.second, 'binary');
    FaceRec(firstPath, secondPath)
    .then(resp => {
      fs.unlinkSync(firstPath);
      fs.unlinkSync(secondPath);
      if(resp === "NoFace")
        web_sock.send(JSON.stringify({processed: true, result: "There are no recognizable faces", corrID: mex.corrID}));
      else
        web_sock.send(JSON.stringify({processed: true, result: resp, corrID: mex.corrID}));
    });
    
  }
})
web_sock.on("error", err => {
  console.log("il server si è disconnesso");
})

module.exports = { FaceRec };