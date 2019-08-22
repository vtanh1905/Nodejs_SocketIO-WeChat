// Import Express
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Import Module
var expressLayouts = require('express-ejs-layouts');
var flash = require('connect-flash');
var session = require('express-session');
var moment = require('moment');
var passport = require('passport');
var socket_io    = require( "socket.io" );




//Import Our Module
var systemConfig = require('./config/system');
require('./config/database')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', '_layouts/layout_default');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Setting Session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 10 * 60 * 1000
   }
}));

require('./config/passport')(app);


//Setting Connect-Flash
app.use(flash());


//Setting Path
global.__dirapp = __dirname;


//Local Variable
app.locals.systemConfig = systemConfig;
app.locals.moment = moment;

app.use(require('./middleware/getUser'));


//SocketIO
var io           = socket_io();
app.io           = io;

//Import Routes
app.use('/blog', require('./routes/frontend/index'));
app.use(`/${systemConfig.prefixAdmin}`, require('./routes/backend/index'));
app.use('/', require('./routes/chat/index')(io));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    layout : false
  });
});

module.exports = app;
