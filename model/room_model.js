var fs = require('fs');

var RoomModule = require('./../schema/rooms_schema');

var pathApp = require('./../config/pathApp');
var pathRoom = pathApp.path_public + pathApp.path_room;


module.exports = {
    listItems: (queryGetItems, querySort, elementPerPage, positionGetElement, options) => {
        return RoomModule
            .find(queryGetItems)
            .sort(querySort)
            .limit(elementPerPage)
            .skip(positionGetElement);
    },

    getItemByID: (id, options) => {
        return RoomModule.find({
            _id: id
        });
    },


    countItem: (query, options) => {
        return RoomModule.find(query).countDocuments();
    },

    saveItem: async (item, options) => {
        if (options.task === "add") {
            return new RoomModule(item).save();
        }

        if (options.task === "edit") {

            var itemOld = await RoomModule.find({_id: item.id});;
            if(item.thumbnail){
                if(itemOld[0].thumbnail){
                    fs.unlinkSync(global.__dirapp + pathRoom + itemOld[0].thumbnail);
                }
            }else{
                item.thumbnail = itemOld[0].thumbnail;
            }
            
            return RoomModule.updateOne({
                _id: item.id
            }, {
                name: item.name,
                ordering: item.ordering,
                status: item.status,
                thumbnail: item.thumbnail,
                modified: {
                    user_id: '',
                    user_name: 'admin',
                    time: Date()
                }
            });
        }
    },

    changeStatus: (id, status, options) => {
        if (options.task === 'single') {
            return RoomModule.updateOne({
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
            return RoomModule.updateMany({
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
            var item = await RoomModule.find({_id: id});;
            if(item[0].thumbnail){
                fs.unlinkSync(global.__dirapp + pathRoom + item[0].thumbnail);
            }
            
            return RoomModule.deleteOne({
                _id: id
            });
        }

        if (options.task === 'multi') {
            return RoomModule.deleteMany({
                _id: {
                    $in: id
                }
            });
        }
    },

    changeOrdering: async (arrID, arrOrdering, options) => {

        for (let index = 0; index < arrID.length; index++) {
            const element = arrID[index];
            
            await RoomModule.updateOne({
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