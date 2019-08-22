const { check } = require('express-validator');
var Notify = require('./../config/notify');

module.exports = [
    check('name', Notify.ERROR_NAME_EMPTY).not().isEmpty(),
    check('ordering', Notify.ERROR_ORDERING).isInt({min : 1, max : 100}),
    check('status', Notify.ERROR_STATUS).not().equals('novalue'),
    check('content', Notify.ERROR_CONTENT).isLength({ min: 5, max : 100 }),
]