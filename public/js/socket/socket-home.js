//var socket = io();
var socket = io.connect('http://localhost:3000');

//Init
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

var countAddFriend  = $("#countAddFriend");
var msgAddFriend    = $("#msgAddFriend");
var listAddFriend   = $("#listAddFriend");
//Set ScrollView 
divBoxChat.animate({ scrollTop: divBoxChat[0].scrollHeight });


/**
|--------------------------------------------------
| SEND
|--------------------------------------------------
*/
//SEND : CLIENT_SEND_ALL_MSG
formBoxChat.submit(function (event) {
    event.preventDefault();
    socket.emit(`${prefix}CLIENT_SEND_ALL_MSG`, {
        content     : txtMSG.val(),
        username    : txtUsername.val(),
        avatar      : txtAvatar.val()
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

//SEND : CLIENT_SEND_USER
socket.emit(`${prefix}CLIENT_SEND_USER`, {
    username: txtUsername.val(),
    avatar: txtAvatar.val()
});

//SEND : CLIENT_SEND_IS_TYPING
formBoxChat.keyup(function(event){
    socket.emit(`${prefix}CLIENT_SEND_IS_TYPING`, {username : txtUsername.val() , checkIsTyping : true});
});
//--------------------------------------------------


/**
|--------------------------------------------------
| RECEIVE
|--------------------------------------------------
*/
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
    clearTimeout(timeTyping);
    timeTyping = setTimeout(function(){
        $(`.boxUserTyping-${data.username}`).remove();
    }, 500);

    var html = `<p class="show-typing boxUserTyping-${data.username}">${data.username} is typing</p>`;
    $(html).insertAfter(boxBody);
});

//Receive : SERVER_SEND_LIST_USER_ONLINE
socket.on(`${prefix}SERVER_SEND_LIST_USER_ONLINE`, (data) => {
    boxUserOnline.html("");
    //Count User Online
    tagCountUserOnline.text(data.length - 1);

    var xhtml = "";
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        if(item.username === txtUsername.val()){
            continue;
        }
        xhtml += `<div class="user">
                    <div class="col-md-8 user-avatar">
                        <img class="contacts-list-img" src="images/users/${item.avatar}" alt="User Image" height="40px" width="40px">
                        <h5>${item.username}</h5>
                    </div>
                    <div class="col-md-4"><button type="button" data-username="${item.username}" data-avatar="${item.avatar}" class="btn btn-block btn-primary btn-w btn-sm btn-add-friend">Add
                            friend</button></div>
                </div>`;
        boxUserOnline.html(xhtml);
    }
});
//--------------------------------------------------

/**
|--------------------------------------------------
| AJAX Add Friend
|--------------------------------------------------
*/
$(document).on("click", ".btn-add-friend", function(e){
    $.ajax({
        method: "POST",
        url: "api/add-friend",
        data: {
            sendAddFriend_username : txtUsername.val(),
            sendAddFriend_avatar   : txtAvatar.val(),
            recieveAddFriend_username : $( this ).data("username"),
            recieveAddFriend_avatar :$( this ).data("avatar")
        }
    }).done(function (data) {
        if(data){
            socket.emit(`${prefix}CLIENT_SEND_ADD_FRIEND`, data);
        }
    });
});


//Receive : SERVER_SEND_ADD_FRIEND
socket.on(`${prefix}SERVER_SEND_ADD_FRIEND`, (data) => {
    var updateCountAddFriend = parseInt(countAddFriend.text()) + 1;
    countAddFriend.text(updateCountAddFriend);
    msgAddFriend.text(`You have ${updateCountAddFriend} invitations`);

    var xhtml = `<li>
                    <div class="user-invite">
                        <div class="col-md-7 user-avatar">
                            <img class="contacts-list-img" src="images/users/${data.avatar}"
                                alt="User Image">
                            <h5>${data.username}</h5>
                        </div>
                        <div class="col-md-5 btn-action-invite">
                            <button type="button" data-username="${data.username}" data-avatar="${data.avatar}" class="btn btn-block btn-primary btn-control-agree-add-friend">Accept</button>
                            <button type="button" data-username="${data.username}" class="btn btn-block btn-default btn-control-deny-add-friend">Deny</button>
                        </div>
                    </div>
                </li>`;
    if(updateCountAddFriend === 1){
        listAddFriend.append(xhtml);
    }else {
        $(xhtml).insertBefore(listAddFriend.first());
    }

    //Notify
    $.notify({
        // options
        icon: '',
        title: 'Thông Báo : ',
        message: `${data.username} muốn kết bạn với bạn.`,
        url: '#',
        target: '_blank'
    },{
        // settings
        element: 'body',
        type: "info",
        allow_dismiss: true,
        placement: {
            from: "bottom",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 1031,
        delay: 5000,
        timer: 1000,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        }
    });
});

/**
|--------------------------------------------------
| Deny Add Friend
|--------------------------------------------------
*/


$(document).on("click", ".btn-control-deny-add-friend", function(e){
    var sendAddFriend_username = $( this ).data("username");
    $.ajax({
        method: "POST",
        url: "api/deny-add-friend",
        data: {
            sendAddFriend_username : sendAddFriend_username,
            recieveAddFriend_username : txtUsername.val(),
        }
    }).done(function (data) {
        if(data){
            var updateCountAddFriend = parseInt(countAddFriend.text()) - 1;
            countAddFriend.text(updateCountAddFriend);
            msgAddFriend.text(`You have ${updateCountAddFriend} invitations`);

            $(`.user-invite:has(button[data-username=${sendAddFriend_username}])`).remove();
        }
    });
});

$(document).on("click", ".btn-control-agree-add-friend", function(e){
    var sendAddFriend_username = $( this ).data("username");
    $.ajax({
        method: "POST",
        url: "api/agree-add-friend",
        data: {
            sendAddFriend_username : sendAddFriend_username,
            sendAddFriend_avatar :$( this ).data("avatar"),
            recieveAddFriend_username : txtUsername.val(),
            recieveAddFriend_avatar   : txtAvatar.val()
        }
    }).done(function (data) {
        if(data){
            var updateCountAddFriend = parseInt(countAddFriend.text()) - 1;
            countAddFriend.text(updateCountAddFriend);
            msgAddFriend.text(`You have ${updateCountAddFriend} invitations`);

            $(`.user-invite:has(button[data-username=${sendAddFriend_username}])`).remove();
        }
    });
});


