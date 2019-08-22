let getParams = (params, property, defaultValue) => {
    if(params[property]){
        return params[property];
    }
    return defaultValue;
}

module.exports = {
    getParams
}