var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('./../model/user_model');


module.exports = (app) => {
    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(new LocalStrategy(
        function (username, password, done) {
            UserModel.getItemByUsername(username).then(users => {
                var user = users[0];
                if (!user) {
                    return done(null, false, {
                        message: 'Thông tin đăng nhập không hợp lệ'
                    });
                }
                if (user.password !== password) {
                    return done(null, false, {
                        message: 'Thông tin đăng nhập không hợp lệ'
                    });
                }
                return done(null, user);
            }).catch(err => {
                return done(err);
            });
        }
    ));


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        UserModel.getItemByID(id).then(users => {
            done(false, users[0]);
        })
    });
};