var RoomModel       = require('./../../model/room_model');
var ChatRoomModel       = require('./../../model/chatroom-model');
var UserServerRoom  = require('./../../class/UserServerRoom');
var prefixROOM          = "ROOM_";
var prefixHOME          = "HOME_";
module.exports = function (io) {
    
    var express = require('express');
    var router = express.Router();

    /* GET home page. */
    router.get('/(:id)', async function (req, res, next) {
        var RoomID = req.params.id || '';
        var infoRoom = await RoomModel.getItemByID(RoomID);
        var listChat = await ChatRoomModel.listItems({room : RoomID}, {}, null, null);
        res.render("chat/pages/room/room", {
            layout      : "chat/_layout/layout_chat",
            infoRoom    : infoRoom[0],
            listChat,
            prefix      : prefixROOM
        });
    });
    var users = new UserServerRoom();
    //SOCKET IO
    io.on("connection", function (socket) {
        console.log("Room : A user connected");
        /**
        |--------------------------------------------------
        | User Online
        |--------------------------------------------------
        */
        //CLIENT_SEND_USER
        socket.on(`${prefixROOM}CLIENT_SEND_USER_AND_ROOM`, (data)=>{
            users.addUser(socket.id, data.username, data.avatar, data.room);
            socket.join(`room_${data.room}`);      
            io.to(`room_${data.room}`).emit(`${prefixROOM}SERVER_SEND_USER_IN_ROOM`, users.getListUserByRoom(data.room));
        });

        //disconnect
        socket.on('disconnect', () => {
            var user = users.getUserByID(socket.id) || null;
            users.removeUser(socket.id);
            if(user){
                io.to(`room_${user.room}`).emit(`${prefixROOM}SERVER_SEND_USER_IN_ROOM`,users.getListUserByRoom(user.room));
            }
        });

        /**
        |--------------------------------------------------
        | Chat Room
        |--------------------------------------------------
        */
        //Receive : CLIENT_SEND_ALL_MSG
        socket.on(`${prefixROOM}CLIENT_SEND_ALL_MSG`, (data) => {
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
                ChatRoomModel.saveItem(data, {
                    task: "add"
                });
                socket.to(`room_${data.room}`).emit(`${prefixROOM}SERVER_SEND_ALL_MSG`, data);
            } else {
                socket.emit(`${prefixROOM}SERVER_SEND_ERROR_MSG`, "Tin nhắn có ký tử không hợp lệ");
            }
        });

        //Receive : CLIENT_SEND_IS_TYPING
        socket.on(`${prefixROOM}CLIENT_SEND_IS_TYPING`, (data) => {
            socket.to(`room_${data.room}`).emit(`${prefixROOM}SERVER_SEND_USER_IS_TYPING`, data);
        });
        /**|--------------------------------------------------*/

    });

    return router;
};