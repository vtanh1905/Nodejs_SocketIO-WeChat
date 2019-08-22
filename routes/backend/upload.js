var express = require('express');

var multer = require('multer');

var router = express.Router();

var upload = require('./../../config/file');

var uploadAvatar = upload.uploadSingle('avatar', '/public/images/upload', 5, ['image/jpeg', 'image/png', 'image/bmp']);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('pages/upload/index', {
    pageTitle: "Upload"
  });
});

router.post('/',function (req, res, next) {
  
  
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  uploadAvatar(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log("Error 1");
      
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log("Error 2");
    }
    // Everything went fine.
    console.log("Proccess");
    return res.redirect('/admin/upload');
  })
});



module.exports = router;