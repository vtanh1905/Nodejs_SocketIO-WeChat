var filterStatus = async (paramStatus, collection) => {
    var Module = require(`./../schema/${collection}_schema`);
    var filterStatus = [{
            name: "ALL",
            value: "all",
            count: 1,
            class: "default"
        },
        {
            name: "ACTIVE",
            value: "active",
            count: 2,
            class: "default"
        },
        {
            name: "INACTIVE",
            value: "inactive",
            count: 69,
            class: "default"
        }
    ];

    //Add Class Success TH ALL
    if (!paramStatus) {
        filterStatus[0].class = "success";
    }

    for (let index = 0; index < filterStatus.length; index++) {
        var queryFilterStatus = {};

        //Add Class Success
        if (filterStatus[index].value === paramStatus) {
            filterStatus[index].class = "success";
        }

        //Xet TH la ALL
        if (filterStatus[index].value !== "all") {
            queryFilterStatus = {
                status: filterStatus[index].value
            };
        }
        filterStatus[index].count = await Module.find(queryFilterStatus).countDocuments();
    }

    return filterStatus;
}

module.exports = {
    filterStatus
}
