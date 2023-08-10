//import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
let stompClient = null;
//let _yourId;
let _userName;
let _yourSymbol;
let _rivalName;

let _statusOfGame={
  "1x1":"",
  "1x2":"",
  "1x3":"",
  "2x1":"",
  "2x2":"",
  "2x3":"",
  "3x1":"",
  "3x2":"",
  "3x3":"",
};

const messages = document.querySelector('#messages');

const disableMove = (e) => {
    document.getElementById("button1x1").setAttribute("disabled","");
    document.getElementById("button1x2").setAttribute("disabled","");
    document.getElementById("button1x3").setAttribute("disabled","");
    document.getElementById("button2x1").setAttribute("disabled","");
    document.getElementById("button2x2").setAttribute("disabled","");
    document.getElementById("button2x3").setAttribute("disabled","");
    document.getElementById("button3x1").setAttribute("disabled","");
    document.getElementById("button3x2").setAttribute("disabled","");
    document.getElementById("button3x3").setAttribute("disabled","");
}

const enableMove = (e) => {
    document.getElementById("button1x1").removeAttribute('disabled');
    document.getElementById("button1x2").removeAttribute('disabled');
    document.getElementById("button1x3").removeAttribute('disabled');
    document.getElementById("button2x1").removeAttribute('disabled');
    document.getElementById("button2x2").removeAttribute('disabled');
    document.getElementById("button2x3").removeAttribute('disabled');
    document.getElementById("button3x1").removeAttribute('disabled');
    document.getElementById("button3x2").removeAttribute('disabled');
    document.getElementById("button3x3").removeAttribute('disabled');
}

const onMessageReceived = (msg) => {
    if(_rivalName==null) {
        const msgBody = JSON.parse(msg.body);
        console.log(msgBody.from);
        if (msgBody.from !== _userName && msgBody.to == 'ALL' && msgBody.message == 'HELLO WORLD!') {
            _rivalName = msgBody.from;
            document.getElementById("chose-symbol").removeAttribute("hidden");
            //const newMsg = document.createElement('p');
            messages.innerHTML = `<b>${msgBody.from}</b> has joined!`;
            //messages.append(newMsg);
            stompClient.send("/app/response", {}, JSON.stringify({
                from: _userName,
                to: _rivalName,
                message: "I'M RIVAL!"
            }));
        }
    }
}

const onPrivateMessageReceived = (msg) => {
    const msgBody = JSON.parse(msg.body);
    //const newMsg = document.createElement('p');
    messages.innerHTML = `<b>${msgBody.from}</b>: chose ${msgBody.message}`;
    //messages.append(newMsg);

    _rivalName=msgBody.from;

    if(msgBody.message=="X")
        _yourSymbol="O";
    else
        _yourSymbol="X";

    document.getElementById("game").removeAttribute("hidden");

    disableMove();

    console.log(_yourSymbol)
}

const onLostReceived = (msg) => {
    const msgBody = JSON.parse(msg.body);
    const newAnnouncement = document.createElement('p');
    newAnnouncement.innerHTML = `${msgBody.from} won!`;
    messages.append(newAnnouncement);
}

const onMoveReceived = (msg) => {
    const msgBody = JSON.parse(msg.body);
    console.log(msgBody.message);
    if(document.getElementById("button"+msgBody.message).innerHTML===""){
        if(_yourSymbol=="X")
            document.getElementById("button"+msgBody.message).innerHTML="O";
        else
            document.getElementById("button"+msgBody.message).innerHTML="X";

        enableMove();
    }
}

const onResponseReceived = (msg) =>{
    const msgBody = JSON.parse(msg.body)
    _rivalName=msgBody.from;
}

const connect = (e) => {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        stompClient.subscribe(`/user/${_userName}/privateMessage`, onPrivateMessageReceived);
        stompClient.subscribe(`/user/${_userName}/response`, onResponseReceived);
        stompClient.subscribe(`/user/${_userName}/lost`, onLostReceived);
        stompClient.subscribe(`/user/${_userName}/move`, onMoveReceived);
        stompClient.subscribe('/messages/public', onMessageReceived);
        stompClient.send("/app/newUser", {}, JSON.stringify({
            from: _userName,
            to: 'ALL',
            message: 'Hello world!'
        }));

    }, err => console.log(err));
    document.getElementById("messages").innerHTML="waiting for rival...";
}

function play(){

    if(document.getElementById("user-name-input").value !== ""){
        let userName = document.getElementById("user-name-input").value;
        _userName=userName;

        connect();
    }
}


const delay = ms => new Promise(res => setTimeout(res, ms));
let t;
function symbol(yourSymbol){
    _yourSymbol = yourSymbol;
    stompClient.send('/app/message', {}, JSON.stringify({
        from: _userName,
        to: _rivalName,
        message: yourSymbol
    }));
    document.getElementById("chose-symbol").setAttribute("hidden",'');
    document.getElementById("game").removeAttribute("hidden");
}

function move(coordinates){
    if(_statusOfGame[coordinates]==""){
        _statusOfGame[coordinates]=_yourSymbol;

        if(document.getElementById("button"+coordinates).innerHTML===""){
            document.getElementById("button"+coordinates).innerHTML=_yourSymbol;
            console.log(document.getElementById("button"+coordinates).innerHTML);}

        disableMove();
        if((_statusOfGame["1x1"]==_yourSymbol && _statusOfGame["1x2"]==_yourSymbol && _statusOfGame["1x3"]==_yourSymbol) ||
            (_statusOfGame["2x1"]==_yourSymbol && _statusOfGame["2x2"]==_yourSymbol && _statusOfGame["2x3"]==_yourSymbol) ||
            (_statusOfGame["3x1"]==_yourSymbol && _statusOfGame["3x2"]==_yourSymbol && _statusOfGame["3x3"]==_yourSymbol) ||
            (_statusOfGame["1x1"]==_yourSymbol && _statusOfGame["2x1"]==_yourSymbol && _statusOfGame["3x1"]==_yourSymbol) ||
            (_statusOfGame["1x2"]==_yourSymbol && _statusOfGame["2x2"]==_yourSymbol && _statusOfGame["3x2"]==_yourSymbol) ||
            (_statusOfGame["1x3"]==_yourSymbol && _statusOfGame["2x3"]==_yourSymbol && _statusOfGame["3x3"]==_yourSymbol) ||
            (_statusOfGame["1x1"]==_yourSymbol && _statusOfGame["2x2"]==_yourSymbol && _statusOfGame["3x3"]==_yourSymbol) ||
            (_statusOfGame["1x3"]==_yourSymbol && _statusOfGame["2x2"]==_yourSymbol && _statusOfGame["3x1"]==_yourSymbol)
        )
        {

        messages.innerHTML = `You won!`;

            stompClient.send("/app/lost", {}, JSON.stringify({
                from: _userName,
                to: _rivalName,
                message: 'You lost!'
            }));
        }
        else{
            stompClient.send("/app/move", {}, JSON.stringify({
                from: _userName,
                to: _rivalName,
                message: coordinates
            }));
        }
    }
    else
        messages.innerHTML="Select an empty field."
}

