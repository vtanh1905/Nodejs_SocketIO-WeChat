var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render("chat/pages/list-friend/list-friend", {
        layout: "chat/_layout/layout_chat"
    });
});


module.exports = router;