var express = require('express');
var UserModel = require('./../../model/user_model');
var GroupModel = require('./../../model/group_model');
var FilterStatusUtils = require('./../../helpers/filterStatus');
var ParamsUtils = require('./../../helpers/params');
var PaginationUtils = require('./../../helpers/pagination');
var SystemConfig = require('./../../config/system');
var Notify = require('./../../config/notify');
var UsersValidator = require('./../../validator/user_validator');
const util = require('util');
var linkIndex = `/${SystemConfig.prefixAdmin}/users`;
const { validationResult } = require('express-validator');

var fs = require('fs');

var multer = require('multer');
var upload = require('./../../config/file');

var pathApp = require('./../../config/pathApp');
var pathAvatar = pathApp.path_public + pathApp.path_avatar;
var uploadAvatar = upload.uploadSingle('avatar', pathAvatar, 5, ['image/jpeg', 'image/png', 'image/bmp']);

var router = express.Router();


router.get('/form(/:id)?', async function (req, res, next) {
  var id = req.params.id || '';
  var pageTitle = 'User Management - ';
  var item = [{
    ordering: 0,
    group_acp: {
      group_id: ''
    }
  }];

  if (id === '') {
    pageTitle += 'Add';
  } else {
    pageTitle += 'Edit';
    item = await UserModel.getItemByID(id);
  }

  //Lây Group
  var groups = await GroupModel.getAllItems();

  res.render('pages/user/form', {
    pageTitle,
    item: item[0],
    errors: null,
    groups,
    pathAvatar : pathApp.path_avatar
  });
});

router.post('/form/save', async function (req, res, next) {
  uploadAvatar(req, res, async function (err) {
    var isAdd = (req.body.id) ? false : true;
    //Lây Group
    var groups = await GroupModel.getAllItems();
    // Everything went fine.
    await UsersValidator(req);
    const errors = validationResult(req).errors;

    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      errors.push({
        msg: "Kích thước File quá lớn"
      });

    } else if (err) {
      // An unknown error occurred when uploading.
      errors.push({
        msg: "File không hợp lệ"
      });
    }

    if (errors.length > 0) {
      var item = req.body;
      item['group_acp'] = {
        group_id: req.body.group_id,
        group_name: req.body.group_name,
      }

      //Remove Image
      fs.unlinkSync(req.file.path);
      return res.render('pages/user/form', {
        pageTitle: `User Management - ${(isAdd) ? 'Add' : 'Edit'}`,
        item: item,
        groups,
        errors: errors
      });
    }

    if (isAdd) { // ADD
      var item = req.body;
      item['created'] = {
        user_id: '',
        user_name: 'admin',
        time: Date()
      };
      item['modified'] = {
        user_id: '',
        user_name: 'admin',
        time: Date()
      };
      item['group_acp'] = {
        group_id: req.body.group_id,
        group_name: req.body.group_name,
      }
      if(req.file !== undefined){
        item['avatar'] = req.file.filename;
      }
      await UserModel.saveItem(item, {
        task: 'add'
      });

      req.flash('info', Notify.ADD_SUCCESS);
      res.redirect(linkIndex);
    } else { // Edit
      if(req.file !== undefined){
        req.body['avatar'] = req.file.filename;
      }
      await UserModel.saveItem(req.body, {
        task: 'edit'
      });

      req.flash('info', Notify.UPDATE_SUCCESS);
      res.redirect(linkIndex);
    }
  });
});



/* GET users listing. */
router.get('/(:status)?', async function (req, res, next) {
  //var paramStatus = req.params.status;
  var currentParam = ParamsUtils.getParams(req.params, 'status', 'all');
  var textSearch = req.query.search;

  var filterStatus = await FilterStatusUtils.filterStatus(currentParam, 'users');

  //Xet Điều Kiện Sort
  var name_field = req.session.name_field || 'ordering';
  var type_sort = req.session.type_sort || 'asc';

  var querySort = {};
  querySort[name_field] = type_sort;

  //Xet Điều Kiện duyệt
  var queryGetItems = {};

  //Set Group
  var filter_group_id = req.session.filter_group_id || '';
  if (filter_group_id != '') {
    queryGetItems['group_acp.group_id'] = filter_group_id;
  }


  //Set Query Items With Status
  if (currentParam && currentParam !== "all") {
    queryGetItems['status'] = currentParam;
  }

  //Set Query String Search
  if (textSearch) {
    //Regular Search
    queryGetItems['name'] = {
      $regex: textSearch,
      $options: 'i'
    };

    //Full Text Search 
    //queryGetItems['$text'] = { $search: textSearch };
  }

  //Lây Group
  var groups = await GroupModel.getAllItems();


  //Xu lý Pagination
  var currentPage = parseInt(req.query.page) || 1;
  var totalElement = await UserModel.countItem(queryGetItems);

  //Xu lý Pagination
  var pagination = PaginationUtils(totalElement, currentPage, 9, 3);

  var items = await UserModel.listItems(queryGetItems, querySort, pagination.elementPerPage, pagination.positionGetElement);

  res.render('pages/user/index', {
    pageTitle: "User Management",
    items: items,
    filterStatus,
    textSearch,
    currentParam,
    pagination,
    messages: req.flash('info'),
    name_field,
    type_sort,
    groups,
    filter_group_id,
    pathAvatar : pathApp.path_avatar
  });
});

//Change Status
router.get('/change-status/(:id)/(:status)', async function (req, res, next) {

  var id = req.params.id || '';
  var status = req.params.status || 'active';
  status = (status !== 'active') ? 'active' : 'inactive';
  await UserModel.changeStatus(id, status, {
    task: 'single'
  });

  req.flash('info', Notify.STATUS_SUCCESS);
  res.redirect(linkIndex);

});

//Multi Change Status
router.post('/change-status/(:status)', async function (req, res, next) {
  var setStatus = req.params.status || 'active';
  var countElemetChanged = await UserModel.changeStatus(req.body.cid, setStatus, {
    task: 'multi'
  });

  req.flash('info', util.format(Notify.MULTI_STATUS_SUCCESS, countElemetChanged.n));
  res.redirect(linkIndex);
});

//Multi Delete Element
router.post('/delete/', async function (req, res, next) {
  var countElemetDeleted = await UserModel.deleteItems(req.body.cid, {
    task: 'multi'
  });
  req.flash('info', util.format(Notify.MULTI_DELETE_SUCCESS), countElemetDeleted.n);
  res.redirect(linkIndex);
});

//Delete Element
router.get('/delete/(:id)', async function (req, res, next) {
  var id = req.params.id || '';

  await UserModel.deleteItems(id, {
    task: 'single'
  });

  req.flash('info', Notify.DELETE_SUCCESS);
  res.redirect(linkIndex);
});

//Multi Change Ordering
router.post('/save-ordering/', async function (req, res, next) {
  var arrID = req.body.cid;
  var arrOrdering = req.body.ordering;
  if (!Array.isArray(arrID)) {
    arrID = [arrID];
    arrOrdering = [arrOrdering];
  }

  await UserModel.changeOrdering(arrID, arrOrdering);

  req.flash('info', util.format(Notify.MULTI_ORDERING_SUCCESS, arrID.length));
  res.redirect(linkIndex);
});


//Sort
router.get('/sort/:name_field/:type_sort', function (req, res, next) {
  req.session.name_field = req.params.name_field || 'ordering';
  req.session.type_sort = req.params.type_sort || 'asc';

  res.redirect(linkIndex);
});


//Filter-Group
router.post('/filter-group', function (req, res, next) {
  req.session.filter_group_id = req.body.group_id || '';

  res.redirect(linkIndex);
});





module.exports = router;