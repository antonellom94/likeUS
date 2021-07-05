const faceapi = require('face-api.js');
const canvas = require('canvas');
const sizeOf = require('image-size');
const fs = require('fs');
const amqp = require('amqplib/callback_api');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = `${__dirname}/models/`;

async function FaceRec(firstSource, secondSource, encoding){

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

  //Stessa cosa per la seconda immagine
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

  if(firstFullDescr === undefined || secondFullDescr === undefined) return "NoFace";
   
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
  return buffer.toString(encoding);
}

// Connection to broker
var connectToBroker = async() => {
  return new Promise((resolve, reject) => {
    // Connection setup server side
    amqp.connect('amqp://rabbitmq', async function(error0, connection) {
      if (error0) {
        reject(error0);
        return;
      }
      connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }
        var queue = process.argv[2];
        var encoding = process.argv[3];
        if(queue === "rpc_queue"){
          console.log("è rpc_queue");
        }
        if(queue === "rpcAPI_queue"){
          console.log("è rpcAPI_queue");
        }
        channel.assertQueue(queue, {
          durable: false
        });
        channel.prefetch(1);
        channel.consume(queue, function reply(msg) {
          console.log("recieved message");
          var mex = JSON.parse(msg.content.toString());
          // process data ...
          let firstPath = "./"+msg.properties.correlationId+"first.jpg";
          let secondPath = "./"+msg.properties.correlationId+"second.jpg";
          fs.writeFileSync(firstPath, mex.first, encoding);
          fs.writeFileSync(secondPath, mex.second, encoding);
          FaceRec(firstPath, secondPath, encoding)
          .then(resp => {
            fs.unlinkSync(firstPath);
            fs.unlinkSync(secondPath);
            if(resp === "NoFace")
              channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({processed: true, result: "There are no recognizable faces", id: msg.properties.correlationId})), {correlationId: msg.properties.correlationId});
            else
              channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({processed: true, result: resp, id: msg.properties.correlationId})), {correlationId: msg.properties.correlationId});
            
            channel.ack(msg);
          })
          .catch(err => {
            fs.unlinkSync(firstPath);
            fs.unlinkSync(secondPath);
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({processed: true, result: "There are no recognizable faces", id: msg.properties.correlationId})), {correlationId: msg.properties.correlationId});
            channel.ack(msg);
          })
        });
        console.log("Succesfully connected to broker... Ready for processing");
        resolve();
      });
    }); 
  });
}

// wait for the broker which is starting up

var pollConnectionAtStartUp = async () =>{
  while(true){
    try{
      await connectToBroker();
      console.log("Connected to broker");
      break;
    }
    catch(err){
      await async function(){
        return new Promise((resolve, reject)=>{
          setTimeout(()=>{
            resolve();
          }, 8000);
        });
      }
    }
  }
}

pollConnectionAtStartUp();

// enable graceful stop

process.on('SIGTERM', () => {
  process.exit(0);
});

