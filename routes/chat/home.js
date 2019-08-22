var ChatModel       = require('./../../model/chat_model');
var RoomModel       = require('./../../model/room_model');
var UserServer      = require('./../../class/UserServer');
var prefixHOME          = "HOME_";

module.exports = function (io) {
    
    var express = require('express');
    var router = express.Router();

    /* GET home page. */
    router.get('/', async function (req, res, next) {
        var listRoom = await RoomModel.listItems({status : 'active'}, {}, null, null);
        var listChat = await ChatModel.listItems({}, {}, null, null);
        res.render("chat/pages/home/home", {
            layout: "chat/_layout/layout_chat",
            listChat,
            listRoom,
            prefix : prefixHOME
        });
    });


    let listUser = new UserServer();
    //SOCKET IO
    io.on("connection", function (socket) {
        console.log("A user connected");
        /**
        |--------------------------------------------------
        | User Online
        |--------------------------------------------------
        */
        //Receive : CLIENT_SEND_USER
        socket.on(`${prefixHOME}CLIENT_SEND_USER`, (data) => {
            listUser.addUser(socket.id, data.username, data.avatar);
            io.emit(`${prefixHOME}SERVER_SEND_LIST_USER_ONLINE`, listUser.getListUser());
        });

        socket.on('disconnect', () => {
            listUser.removeUser(socket.id);
            io.emit(`${prefixHOME}SERVER_SEND_LIST_USER_ONLINE`, listUser.getListUser());
        });
        /**|--------------------------------------------------*/



        /**
        |--------------------------------------------------
        | Chat ALL
        |--------------------------------------------------
        */
        //Receive : CLIENT_SEND_ALL_MSG
        socket.on(`${prefixHOME}CLIENT_SEND_ALL_MSG`, (data) => {
            //Check Content
            var checkString = true;
            var content = data.content;
            var arrayWordCheck = ["fuck", "LOL"];
            arrayWordCheck.forEach(element => {
                var n = content.search(element);
                if (n !== -1) {
                    checkString = false;
                    return;
                }
            });

            if (checkString === true) {
                data["created"] = Date();
                ChatModel.saveItem(data, {
                    task: "add"
                });
                socket.broadcast.emit(`${prefixHOME}SERVER_SEND_ALL_MSG`, data);
            } else {
                socket.emit(`${prefixHOME}SERVER_SEND_ERROR_MSG`, "Tin nhắn có ký tử không hợp lệ");
            }

        });

        //Receive : CLIENT_SEND_IS_TYPING
        socket.on(`${prefixHOME}CLIENT_SEND_IS_TYPING`, (data) => {
            socket.broadcast.emit(`${prefixHOME}SERVER_SEND_USER_IS_TYPING`, data);
        });
        /**|--------------------------------------------------*/


        /**
        |--------------------------------------------------
        | ADD Friend
        |--------------------------------------------------
        */
         //Receive : CLIENT_SEND_ADD_FRIEND
         socket.on(`${prefixHOME}CLIENT_SEND_ADD_FRIEND`, (data) => {
            var userSend    = data.itemSend;
            var userReceive = listUser.getUserByUsername(data.itemRecieve.username);
            io.to(`${userReceive.id}`).emit(`${prefixHOME}SERVER_SEND_ADD_FRIEND`, userSend);
        });
    });

    return router;
};