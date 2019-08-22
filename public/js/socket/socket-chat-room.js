//var socket = io();
var socket = io.connect('http://localhost:3000');


var formBoxChat         = $("#formBoxChat");
var divBoxChat          = $("#divBoxChat");
var txtMSG              = $("#txtMSG");
var txtUsername         = $("input[name=username]");
var txtAvatar           = $("input[name=avatar]");
var boxError            = $("#boxError");
var boxBody             = $('#boxBody');
var areaEmojioneArea    = txtMSG.emojioneArea()[0];
var timeTyping;
var tagCountUserOnline  = $("#tagCountUserOnline");
var boxUserOnline       = $("#boxUserOnline");
var prefix              = $("input[name=prefix]").val();
var txtRoomID           = $("input[name=roomID]");
var countUserOnline     = $("#countUserOnline");
var countMemeberOnline  = $("#countMemeberOnline");

divBoxChat.animate({ scrollTop: divBoxChat[0].scrollHeight });

/**
|--------------------------------------------------
| SEND
|--------------------------------------------------
*/
//Send : CLIENT_SEND_USER
socket.emit(`${prefix}CLIENT_SEND_USER_AND_ROOM`, {
    username: txtUsername.val(),
    avatar: txtAvatar.val(),
    room : txtRoomID.val()
});

//Send : CLIENT_SEND_USER cho trang home
socket.emit('HOME_CLIENT_SEND_USER', {
    username: txtUsername.val(),
    avatar: txtAvatar.val()
});

//SEND : CLIENT_SEND_ALL_MSG
formBoxChat.submit(function (event) {
    event.preventDefault();
    socket.emit(`${prefix}CLIENT_SEND_ALL_MSG`, {
        content     : txtMSG.val(),
        username    : txtUsername.val(),
        avatar      : txtAvatar.val(),
        room        : txtRoomID.val()
    });
    

    var html = `<div class="direct-chat-msg right">
                    <div class="direct-chat-info clearfix">
                        <span class="direct-chat-name pull-right">${txtUsername.val()}</span>
                        <span class="direct-chat-timestamp pull-left">${moment().format("DD MMM LT")}</span>
                    </div>
                    <!-- /.direct-chat-info -->
                    <img class="direct-chat-img" src="images/users/${txtAvatar.val()}" alt="Message User Image">
                    <!-- /.direct-chat-img -->
                    <div class="direct-chat-text">
                        ${txtMSG.val()}
                    </div>
                    <!-- /.direct-chat-text -->
                </div>`;
    
    txtMSG.val('');
    areaEmojioneArea.emojioneArea.setText('');
    $("#boxError").remove();
    divBoxChat.animate({ scrollTop: divBoxChat[0].scrollHeight });
    divBoxChat.append(html);
});

//SEND : CLIENT_SEND_IS_TYPING
formBoxChat.keyup(function(event){
    socket.emit(`${prefix}CLIENT_SEND_IS_TYPING`, {username : txtUsername.val() , room : txtRoomID.val(),checkIsTyping : true});
});
//--------------------------------------------------

/**
|--------------------------------------------------
| RECEIVE
|--------------------------------------------------
*/
//RECEIVE SERVER_SEND_USER_IN_ROOM
socket.on(`${prefix}SERVER_SEND_USER_IN_ROOM`, (data)=>{
    //Count
    countUserOnline.text(data.length - 1);
    countMemeberOnline.text(data.length);

    boxUserOnline.html("");
    var xhtml = "";
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if(element.username === txtUsername.val()){
            continue;
        }
        xhtml += `<div class="user">
                    <div class="col-md-7 user-avatar">
                        <img class="contacts-list-img" src="images/users/${element.avatar}" alt="User Image">
                        <h5>${element.username}</h5>
                    </div>
                    <div class="col-md-5"><button type="button" class="btn btn-block btn-primary btn-sm btn-w">Add
                            friend</button></div>
                </div>`;
    }
    boxUserOnline.html(xhtml);
});

//RECEIVE : SERVER_SEND_ALL_MSG
socket.on(`${prefix}SERVER_SEND_ALL_MSG`, (data) =>{
    var html = `<div class="direct-chat-msg">
                    <div class="direct-chat-info clearfix">
                        <span class="direct-chat-name pull-left">${data.username}</span>
                        <span class="direct-chat-timestamp pull-right">${moment(data.created).format("DD MMM LT")}</span>
                    </div>
                    <!-- /.direct-chat-info -->
                    <img class="direct-chat-img"  src="images/users/${data.avatar}" alt="Message User Image">
                    <!-- /.direct-chat-img -->
                    <div class="direct-chat-text">
                            ${data.content}
                    </div>
                    <!-- /.direct-chat-text -->
                </div>`;
    divBoxChat.animate({ scrollTop: divBoxChat[0].scrollHeight });
    divBoxChat.append(html);
});

//RECEIVE : SERVER_SEND_ERROR_MSG
socket.on(`${prefix}SERVER_SEND_ERROR_MSG`, (err) =>{
    var html = `<div class="alert alert-danger alert-dismissible fade in" id="boxError">
                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Error!</strong>  ${err}
                </div>`;
    $(html).insertBefore(formBoxChat);

    //Remove Final MSG
    var listMyMSG = $("div.direct-chat-msg.right");
    listMyMSG[listMyMSG.length - 1].remove();
});

//Receive : SERVER_SEND_USER_IS_TYPING
socket.on(`${prefix}SERVER_SEND_USER_IS_TYPING`, (data)=>{
    console.log(123123);
    
    clearTimeout(timeTyping);
    timeTyping = setTimeout(function(){
        $(`.boxUserTyping-${data.username}`).remove();
    }, 500);

    var html = `<p class="show-typing boxUserTyping-${data.username}">${data.username} is typing</p>`;
    $(html).insertAfter(boxBody);
});
//--------------------------------------------------