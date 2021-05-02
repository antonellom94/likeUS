var counter, ws;
var go_vitaletti_go = true;
function start_ws() {
  counter = 0;
  ws = new WebSocket("ws://localhost:3000/");

  ws.onmessage = (event) => {
    let mex = JSON.parse(event.data);
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
