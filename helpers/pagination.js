let SettingPagiantion = (totalElement, currentPage, elementPerPage, rangePage) => {
    var pagination = {
        totalElement        : totalElement,
        currentPage         : currentPage,
        elementPerPage      : elementPerPage,
        rangePage           : rangePage,
        totalPage           : Math.ceil(totalElement / elementPerPage),
        positionGetElement : (currentPage - 1) * elementPerPage // Để truyền vào .skip()
    };
    // Xet Vi Trí Lấy của Phần Từ Bắt Đầu Và Kết Thúc
    pagination['elementStart']  = pagination.positionGetElement + 1;
    pagination['elementEnd']    = ((pagination.positionGetElement + pagination.elementPerPage) > totalElement) ? totalElement : pagination.positionGetElement + pagination.elementPerPage;

    //TH totalPage < rangePage
    if(pagination.totalPage <= pagination.rangePage){
        pagination['pageStart'] = 1;
        pagination['pageEnd']   = pagination.totalPage;
        return pagination;
    }

    //Xet vi trí page xuat hiện tren thanh pagination
    pagination['pageStart']     = pagination.currentPage - Math.floor(pagination.rangePage / 2);
    pagination['pageEnd']       = pagination.currentPage + Math.floor(pagination.rangePage / 2);
    

    if(pagination['pageStart'] <= 1){
        pagination['pageStart'] = 1;
        pagination['pageEnd']   = pagination['pageStart'] + (pagination.rangePage - 1);
    }else if (pagination['pageEnd'] > pagination.totalPage){
        pagination['pageStart'] = (pagination.totalPage - (pagination.rangePage - 1) <= 0) ? 1 : pagination.totalPage - (pagination.rangePage - 1);
        pagination['pageEnd']   = pagination.totalPage;
    }

    return pagination;
}

module.exports = SettingPagiantion;

/*

*/