var ItemModule = require('./../schema/items_schema');

module.exports = {
    listItems: (queryGetItems, querySort, elementPerPage, positionGetElement, options) => {
        return ItemModule
            .find(queryGetItems)
            .sort(querySort)
            .limit(elementPerPage)
            .skip(positionGetElement);
    },

    getItemByID: (id, options) => {
        return ItemModule.find({
            _id: id
        });
    },

    countItem: (query, options) => {
        return ItemModule.find(query).countDocuments();
    },

    saveItem: (item, options) => {
        if (options.task === "add") {
            return new ItemModule(item).save();
        }

        if (options.task === "edit") {
            return ItemModule.updateOne({
                _id: item.id
            }, {
                name: item.name,
                ordering: item.ordering,
                status: item.status,
                content: item.content,
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
            return ItemModule.updateOne({
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
            return ItemModule.updateMany({
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

    deleteItems: (id, options) => {
        if (options.task === 'single') {
            return ItemModule.deleteOne({
                _id: id
            });
        }

        if (options.task === 'multi') {
            return ItemModule.deleteMany({
                _id: {
                    $in: id
                }
            });
        }
    },

    changeOrdering: async (arrID, arrOrdering, options) => {

        for (let index = 0; index < arrID.length; index++) {
            const element = arrID[index];
            
            await ItemModule.updateOne({
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