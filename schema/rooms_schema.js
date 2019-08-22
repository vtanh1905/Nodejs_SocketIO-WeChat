var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    name: String,
    status: String,
    thumbnail: String,
    ordering: Number,
    language: String,
    created : {
        user_id     : String,
        user_name   : String,
        time        : Date
    },
    modified : {
        user_id     : String,
        user_name   : String,
        time        : Date
    }
}, { versionKey: false });

module.exports = mongoose.model('Room', itemSchema);