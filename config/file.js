var multer = require('multer');
const path = require('path');
var nanoid = require('nanoid')


module.exports = {
    uploadSingle: (fieldName, des, fileSize, fileMine) => {
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, __dirapp + des)
            },
            filename: function (req, file, cb) {
                cb(null, nanoid(10) + path.extname(file.originalname))
            }
        });

        var upload = multer({
            storage: storage,
            limits: {
                fileSize: fileSize * 1024 * 1024 // Error 1
            }, 
            fileFilter: function (req, file, cb) {
                var check = fileMine.find(element => element === file.mimetype);
                if (check === undefined) {
                    return cb(new Error('File không hợp lệ')); //Error 2
                }
                cb(null, true);
            }
        }).single(fieldName);

        return upload;
    }
}