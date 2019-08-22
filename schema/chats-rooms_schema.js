var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    content: String,
    username: String,
    avatar: String,
    room  : String,
    created: Date
}, {
    versionKey: false
});

module.exports = mongoose.model('Chats-Rooms', itemSchema);