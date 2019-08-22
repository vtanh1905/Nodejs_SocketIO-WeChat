const { check } = require('express-validator');
var Notify = require('./../config/notify');

// module.exports = [
//     check('name', Notify.ERROR_NAME_EMPTY).not().isEmpty(),
//     check('ordering', Notify.ERROR_ORDERING).isInt({min : 1, max : 100}),
//     check('status', Notify.ERROR_STATUS).not().equals('novalue'),
//     check('group_id', Notify.ERROR_GROUP_ACP).not().equals('noid'),
//     check('content', Notify.ERROR_CONTENT).isLength({ min: 5, max : 100 }),
// ]   


module.exports = async (req) =>{
    await check('name', Notify.ERROR_NAME_EMPTY).not().isEmpty().run(req);
    await check('ordering', Notify.ERROR_ORDERING).isInt({min : 1, max : 100}).run(req);
    await check('status', Notify.ERROR_STATUS).not().equals('novalue').run(req);
    await check('group_id', Notify.ERROR_GROUP_ACP).not().equals('noid').run(req);
    await check('content', Notify.ERROR_CONTENT).isLength({ min: 5, max : 100 }).run(req);
}
