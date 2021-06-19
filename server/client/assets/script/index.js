var counter, ws;
var go_vitaletti_go = true;
function start_ws() {
  counter = 0;
  ws = new WebSocket("ws://localhost:3000/");

  ws.onmessage = (event) => {
    let mex = JSON.parse(event.data);
    if(mex.processed !== undefined && mex.processed === true && mex.result !== undefined){
      document.getElementById("Submit").disabled = false;
      if(mex.result === "There are no recognizable faces"){
        document.getElementById('finalimage').innerHTML = '';
        alert(mex.result);
      }
      else{
        let source = "data:image/jpeg;base64,"+btoa(mex.result);
        document.getElementById('finalimage').innerHTML = '<img src='+source+' height=200px> </br><a href="/">Share your result!</a>';
      }
    }
    else{
      if (mex.color !== undefined) {
        if (counter >= 10) {
          esegui();
        } else {
          document.getElementById("RGB_Button").style.backgroundColor = mex.color;
          counter++;
        }
      } else if (mex.color === undefined && mex.message !== undefined) {
        document.getElementById("chat").innerHTML +=
          "<div class='message others'>" + mex.message + "<div>";
      }
    }
  };
}
function esegui() {
  if (go_vitaletti_go === true) {
    counter = 0;
    ws.send(JSON.stringify({ ok: true }));
    go_vitaletti_go = false;
  } else {
    ws.send(JSON.stringify({ ok: false }));
    go_vitaletti_go = true;
  }
}
function send_message(event) {
  let key = event.which;
  if (key === 13) {
    let txtar = document.getElementById("text_area");
    let text = txtar.value;
    txtar.value = "";
    let chat = document.getElementById("chat");
    chat.innerHTML +=
      "<div class='message-line'><div class='message mine'>" +
      text +
      "</div></div>";
    ws.send(JSON.stringify({ message: text }));
  }
}
function clear_chat() {
  document.getElementById("chat").innerHTML = "";
}
async function readFile(path){
  return new Promise((resolve, reject)=>{
    let reader = new FileReader();
    reader.readAsBinaryString(path);
    reader.onload = ev => {
      resolve(ev.target.result);
    }
    reader.onerror = err => {
      reject(err);
    }
  })
}
function sendImages(){
  document.getElementById('finalimage').innerHTML = '<div class="gears">'+
                                                    '<img src="./assets/images/First.jpg" alt="gear" class="big">'+
                                                    '</br>We are processing your result!'+
                                                    '</br>In the meantime, you can use our chat!'+
                                                    '</div>';
  let first = document.getElementById("First").files[0]; 
  let second = document.getElementById("Second").files[0]; 
  let obj_to_be_sent = {}
  obj_to_be_sent.processing = true;
  console.log(first);
  readFile(first)
  .then( frist_as_text => {
    obj_to_be_sent.first = frist_as_text;
    return readFile(second);
  })
  .then( second_as_text => {
    obj_to_be_sent.second = second_as_text;
    console.log(obj_to_be_sent);
    ws.send(JSON.stringify(obj_to_be_sent));
    document.getElementById("Submit").disabled = true;
  })
  .catch(err => {
    alert(err)
    document.getElementById('finalimage').innerHTML = '';
  })
}