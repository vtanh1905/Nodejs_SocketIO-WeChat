var express = require('express');
var UserModel       = require('./../../model/user_model');

var router = express.Router();

/* GET home page. */
router.post('/add-friend', async (req, res, next) =>{
    var itemSend = {
        username : req.body.sendAddFriend_username,
        avatar   : req.body.sendAddFriend_avatar
    };
    var itemRecieve = {
        username : req.body.recieveAddFriend_username,
        avatar   : req.body.recieveAddFriend_avatar
    };
    var checkChagedSend     = await UserModel.updateFriend(itemSend, itemRecieve, {task : "send"});
    var checkChagedRecieve  = await UserModel.updateFriend(itemSend, itemRecieve, {task : "receive"});
    if(checkChagedSend.n === 0 && checkChagedRecieve.n === 0){
        res.json(null);
    }else{
        res.json({
            itemSend,
            itemRecieve
        });
    }
});

router.post('/deny-add-friend', async (req, res, next) =>{
    var itemSend = {
        username : req.body.sendAddFriend_username
    };
    var itemRecieve = {
        username : req.body.recieveAddFriend_username
    };
    var checkChagedSend     = await UserModel.updateFriend(itemSend, itemRecieve, {task : "deny-send"});
    var checkChagedRecieve  = await UserModel.updateFriend(itemSend, itemRecieve, {task : "deny-receive"});

    if(checkChagedSend.n === 0 && checkChagedRecieve.n === 0){
        res.json(false);
    }else{
        res.json(true);
    }
});

router.post('/agree-add-friend', async (req, res, next) =>{
    console.log(req.body);
    var itemSend = {
        username : req.body.sendAddFriend_username,
        avatar   : req.body.sendAddFriend_avatar
    };
    var itemRecieve = {
        username : req.body.recieveAddFriend_username,
        avatar   : req.body.recieveAddFriend_avatar
    };
    var checkChagedSend     = await UserModel.updateFriend(itemSend, itemRecieve, {task : "agree-send"});
    var checkChagedRecieve  = await UserModel.updateFriend(itemSend, itemRecieve, {task : "agree-receive"});
    
    if(checkChagedSend.n === 0 && checkChagedRecieve.n === 0){
        res.json(false);
    }else{
        res.json(true);
    }
});


module.exports = router;