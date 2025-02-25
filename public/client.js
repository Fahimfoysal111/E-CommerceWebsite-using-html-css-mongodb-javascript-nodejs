let userName;
let roomName;
const input = $("input");
const message_body = $(".message-body");
const classUser = $(".user");

const socket = io();

socket.on('connect', addUser);
socket.on('updateusers', updateUserList);



function addUser() {
    userName =  prompt("Enter your Name!");
    roomName =  prompt("Enter your room name!");

      socket.emit('adduser', userName, roomName);
  }

input.on('keyup', function(e){
    if(e.key === 'Enter'){
        sendMessage(e.target.value)
    }
});

function sendMessage(message){
   let msg= {
       user : userName,
       message : message.trim()
   }
   
   //Append messages
   appendMessage(msg, 'outgoing')
   input.val('');
   goDown()

   //send message to server 
   socket.emit('message', msg);
}

function appendMessage(msg, type){

    let newDiv = document.createElement('div');
    let className = type;
    newDiv.classList.add(className, 'message');

    let markUp = `<h4>${msg.user}</h4>
                <p> ${msg.message}</p>
                `
    newDiv.innerHTML = markUp
    message_body.append(newDiv);
}


function goDown(){
   message_body.scrollTop(message_body.height())
   
}

function sendClick(){
    var message = input.val();
    sendMessage(message) 
}

// Recieve messages 
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    goDown()
})

socket.on('greeting', (data)=>{
    let msg= {
        user : "Server",
        message : "Welcome  "+ data +"! </br> you have been connected !!!. "
    }
    appendMessage(msg, 'incoming')
    goDown()
})


function updateUserList(data) {
	$('.user').empty();
    $('.room').html(roomName);
	$.each(data, function (key, value) {
        if(key.endsWith(roomName)){
    let newSpan = document.createElement('span');
    let markUp = `<img src="user.png" alt="${value}"> <sub class="on_off">${value}</sub> `
    newSpan.innerHTML = markUp
    classUser.append(newSpan);

        }
	});
    
}


$('#imageInput').on('change', function(e){
    var file = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = function(evt){
        socket.emit('uploadImage', evt.target.result , userName); //send image to server
        sendImage(evt.target.result, userName)  
    };
    reader.readAsDataURL(file);
    $('#imageInput').val('');
    
});

function sendImage(data, name){
    //Append messages
    appendFile(data,  name, 'outgoing')
    goDown()
 
 }

function appendFile(data, user, type){

    let newDiv = document.createElement('div');
    let className = type;
    newDiv.classList.add(className, 'message');

    let markUp = `<h4>${user}</h4>
                <img src="${data}" class="uploadedImage" />
                `
    newDiv.innerHTML = markUp
    message_body.append(newDiv);
}


socket.on('publishImage', (data, user)=>{  // server to browser
    appendFile(data, user,  'incoming')
    goDown()

});
