var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number,
    content: String,
    avatar: String,
    username: String,
    password: String,
    group_acp: {
        group_id        : String,
        group_name       : String,
    },
    created : {
        user_id     : String,
        user_name   : String,
        time        : Date
    },
    modified : {
        user_id     : String,
        user_name   : String,
        time        : Date
    },
    listFriend : [{
        username: String,
        avatar  : String
    }],
    listSendAddFriend : [{
        username: String,
        avatar  : String
    }],
    listRecieveAddFriend : [{
        username: String,
        avatar  : String
    }]
}, { versionKey: false });

module.exports = mongoose.model('User', itemSchema);