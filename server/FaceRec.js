const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = `${__dirname}/models/`;

async function FaceRec(firstPath, secondPath){

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  
  //L'immagine deve essere del tipo HTMLImageElement, quindi effettuo queste istruzioni per "convertirla"
  const firstImage = await canvas.loadImage(firstPath);
  const firstImg = canvas.createCanvas(200, 200);
  const firstCtx = firstImg.getContext('2d');
  firstCtx.drawImage(firstImage, 0, 0, 200, 200);

  const secondImage = await canvas.loadImage(secondPath);
  const secondImg = canvas.createCanvas(200, 200);
  const secondCtx = secondImg.getContext('2d');
  secondCtx.drawImage(secondImage, 0, 0, 200, 200);    
  
  //Trova la faccia più riconoscibile nell'immagine e ne trova il descrittore completo
  const firstFullDescr = await faceapi.detectSingleFace(firstImg).withFaceLandmarks().withFaceDescriptor();
  const secondFullDescr = await faceapi.detectSingleFace(secondImg).withFaceLandmarks().withFaceDescriptor();
  
  //Estrae il descrittore (array di 128 float32) dal descrittore completo
  const firstDescr = firstFullDescr.descriptor;
  const secondDescr = secondFullDescr.descriptor;

  //Calcola tramite la distanza euclidea il grado in percentuale di somiglianza dei volti
  const dist = ((1 - faceapi.euclideanDistance(firstDescr, secondDescr))*100).toFixed(2);
  console.log(dist);  
  return dist;
}

module.exports = { FaceRec };