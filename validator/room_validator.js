const { check } = require('express-validator');
var Notify = require('./../config/notify');

module.exports = async (req) =>{
    await check('name', Notify.ERROR_NAME_EMPTY).not().isEmpty().run(req);
    await check('ordering', Notify.ERROR_ORDERING).isInt({min : 1, max : 100}).run(req);
    await check('status', Notify.ERROR_STATUS).not().equals('novalue').run(req);
    await check('language', Notify.ERROR_NAME_EMPTY).not().isEmpty().run(req);
}
