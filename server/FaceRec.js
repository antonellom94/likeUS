const faceapi = require('face-api.js');
const canvas = require('canvas');
const sizeOf = require('image-size');
const fs = require('fs');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = `${__dirname}/models/`;

async function FaceRec(firstPath, secondPath){

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  
  //L'immagine deve essere del tipo HTMLImageElement, quindi effettuo queste istruzioni per "convertirla"
  const firstImage = await canvas.loadImage(firstPath);
  const firstSize = sizeOf(firstPath);
  const firstWidth = firstSize.width;
  const firstHeight = firstSize.height;
  const firstImg = canvas.createCanvas(firstWidth, firstHeight);
  const firstCtx = firstImg.getContext('2d');
  firstCtx.drawImage(firstImage, 0, 0, firstWidth, firstHeight);

  const secondImage = await canvas.loadImage(secondPath);
  const secondSize = sizeOf(secondPath);
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
 
  const secondWidth_afterResize = (secondWidth/secondHeight) * firstHeight;
  const finalImg = canvas.createCanvas(firstWidth + secondWidth_afterResize, firstHeight);
  const finalCtx = finalImg.getContext('2d');
  finalCtx.drawImage(firstImage, 0, 0, firstWidth, firstHeight);
  finalCtx.drawImage(secondImage, 0, 0, secondWidth, secondHeight, firstWidth, 0, secondWidth_afterResize, firstHeight);
  //Nel font va indicata la grandezza, per questo concateno la grandezza voluta con px nomefont
  const mySize = firstHeight/5;
  const myFont = "px Georgia";
  finalCtx.font = mySize + myFont;
  finalCtx.fillStyle = "white";
  finalCtx.textAlign = "center";
  finalCtx.fillText(dist + "%", firstWidth, firstHeight * 9/10);
  const buffer = finalImg.toBuffer('image/png');
  fs.writeFileSync(`${__dirname}/images/Final.png`, buffer);
}

module.exports = { FaceRec };