var express = require('express');
var auth = require('./../../config/auth');
var router = express.Router();



router.use('/', auth.dashboard,require('./home'));

router.use('/items', auth.items, require('./items'));
router.use('/groups', require('./groups'));
router.use('/users', require('./users'));
router.use('/upload', require('./upload'));
router.use('/rooms', require('./rooms'));

module.exports = router;
