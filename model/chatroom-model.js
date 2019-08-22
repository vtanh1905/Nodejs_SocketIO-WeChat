var ItemModule = require('./../schema/chats-rooms_schema');

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

}