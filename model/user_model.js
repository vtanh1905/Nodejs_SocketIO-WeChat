var fs = require('fs');

var UserModule = require('./../schema/users_schema');

var pathApp = require('./../config/pathApp');
var pathAvatar = pathApp.path_public + pathApp.path_avatar;


module.exports = {
    listItems: (queryGetItems, querySort, elementPerPage, positionGetElement, options) => {
        return UserModule
            .find(queryGetItems)
            .sort(querySort)
            .limit(elementPerPage)
            .skip(positionGetElement);
    },

    getItemByID: (id, options) => {
        return UserModule.find({
            _id: id
        });
    },

    getItemByUsername: (username, options) => {
        return UserModule.find({
            username: username
        });
    },

    getItemByUsername: (username, options) => {
        return UserModule.find({
            username: username
        });
    },

    countItem: (query, options) => {
        return UserModule.find(query).countDocuments();
    },

    saveItem: async (item, options) => {
        if (options.task === "add") {
            return new UserModule(item).save();
        }

        if (options.task === "edit") {
            console.log(item);
            
            var itemOld = await UserModule.find({_id: item.id});;
            if(item.avatar){
                if(itemOld[0].avatar){
                    fs.unlinkSync(global.__dirapp + pathAvatar + itemOld[0].avatar);
                }
            }else{
                item.avatar = itemOld[0].avatar;
            }
            
            return UserModule.updateOne({
                _id: item.id
            }, {
                name: item.name,
                ordering: item.ordering,
                status: item.status,
                content: item.content,
                avatar: item.avatar,
                group_acp : {
                    group_id    : item.group_id,
                    group_name  : item.group_name
                },
                modified: {
                    user_id: '',
                    user_name: 'admin',
                    time: Date()
                }
            });
        }

        if (options.task === "update-group_acp") {
            return UserModule.updateMany({
                "group_acp.group_id": item.group_acp.group_id
            }, {
                "group_acp.group_name": item.group_acp.group_name,
            });
        }
    },

    updateFriend : (itemSend, itemReceive ,options) =>{
        if(options.task === "send"){
            return UserModule.updateOne({
                username: itemSend.username,
                "listFriend.username"           : {$ne : itemReceive.username},
                "listSendAddFriend.username"    : {$ne : itemReceive.username},
                "listRecieveAddFriend.username" : {$ne : itemReceive.username}
            }, {
                $push: { listSendAddFriend: {
                    username: itemReceive.username,
                    avatar  : itemReceive.avatar
                } }
            });
        }

        if(options.task === "receive"){
            return UserModule.updateOne({
                username: itemReceive.username,
                "listFriend.username"           : {$ne : itemSend.username},
                "listSendAddFriend.username"    : {$ne : itemSend.username},
                "listRecieveAddFriend.username" : {$ne : itemSend.username}
            }, {
                $push: { listRecieveAddFriend: {
                    username: itemSend.username,
                    avatar  : itemSend.avatar
                } }
            });
        }

        if(options.task === "agree-send"){
            return UserModule.updateOne({
                username: itemSend.username
            }, {
                $pull: { listSendAddFriend: {
                    username: itemReceive.username
                } },
                $push :{ listFriend : {
                    username: itemReceive.username,
                    avatar  : itemReceive.avatar
                } }
            });
        }

        if(options.task === "agree-receive"){
            return UserModule.updateOne({
                username: itemReceive.username
            }, {
                $pull: { listRecieveAddFriend: {
                    username: itemSend.username
                } },
                $push :{ listFriend : {
                    username: itemSend.username,
                    avatar  : itemSend.avatar
                } }
            });
        }

        if(options.task === "deny-send"){
            return UserModule.updateOne({
                username: itemSend.username
            }, {
                $pull: { listSendAddFriend: {
                    username: itemReceive.username,
                } }
            });
        }

        if(options.task === "deny-receive"){
            return UserModule.updateOne({
                username: itemReceive.username
            }, {
                $pull: { listRecieveAddFriend: {
                    username: itemSend.username
                } }
            });
        }
    },

    changeStatus: (id, status, options) => {
        if (options.task === 'single') {
            return UserModule.updateOne({
                _id: id
            }, {
                status: status,
                modified: {
                    user_id: '',
                    user_name: 'admin',
                    time: Date()
                }
            });
        }

        if (options.task === 'multi') {
            return UserModule.updateMany({
                _id: {
                    $in: id
                }
            }, {
                status: status,
                modified: {
                    user_id: '',
                    user_name: 'admin',
                    time: Date()
                }
            });
        }

    },

    deleteItems: async (id, options) => {
        if (options.task === 'single') {
            var item = await UserModule.find({_id: id});;
            if(item[0].avatar){
                fs.unlinkSync(global.__dirapp + pathAvatar + item[0].avatar);
            }
            
            return UserModule.deleteOne({
                _id: id
            });
        }

        if (options.task === 'multi') {
            return UserModule.deleteMany({
                _id: {
                    $in: id
                }
            });
        }
    },

    changeOrdering: async (arrID, arrOrdering, options) => {

        for (let index = 0; index < arrID.length; index++) {
            const element = arrID[index];
            
            await UserModule.updateOne({
                _id: element
            }, {
                ordering: arrOrdering[index],
                modified: {
                    user_id: '',
                    user_name: 'admin',
                    time: Date()
                }
            });
        }

        // return Promise.resolve("Succeed");
    }
}