var express = require('express');
var passport = require('passport');
var auth = require('./../../config/auth');

var router = express.Router();

/* GET home page. */
router.get('/login',auth.login ,function (req, res, next) {
    res.render('chat/pages/login', {
        layout: 'chat/_layout/layout_login',
        error : req.flash('error')[0]
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })
);

router.get('/logout', function (req, res, next) {
    req.logOut();
    res.redirect('/auth/login');
});



module.exports = router;