var auth = require('./../../config/auth');

module.exports = function (io) {
    var express = require('express');
    var router = express.Router();

    router.use('/auth', require('./auth'));
    router.use('/', auth.chat, require('./home')(io));
    router.use('/room', require('./room')(io));
    router.use('/api', require('./api'));
    router.use('/friend', require('./friend'));

    return router;
}