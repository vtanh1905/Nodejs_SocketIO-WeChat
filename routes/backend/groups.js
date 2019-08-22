var express = require('express');
var GroupModel = require('./../../model/group_model');
var UserModel = require('./../../model/user_model');
var FilterStatusUtils =  require('./../../helpers/filterStatus');
var ParamsUtils = require('./../../helpers/params');
var PaginationUtils = require('./../../helpers/pagination');
var SystemConfig = require('./../../config/system');
var Notify = require('./../../config/notify');
var GroupValidator = require('./../../validator/group_validator');
const util = require('util');
var linkIndex = `/${SystemConfig.prefixAdmin}/groups`;
const { check, validationResult } = require('express-validator');

var router = express.Router();



router.get('/form(/:id)?', async function (req, res, next) {
  var id = req.params.id || '';
  var pageTitle = 'Group Management - ';
  var item = [{ordering : 0}];
  if(id === ''){
    pageTitle += 'Add';
  }else {
    pageTitle += 'Edit';
    item = await GroupModel.getItemByID(id);
  }
  
  res.render('pages/group/form', {
    pageTitle,
    item: item[0],
    errors: null
  });
});

router.post('/form/save', GroupValidator , async function (req, res, next) {
  var isAdd = (req.body.id) ? false : true;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var item = req.body;
    
    return res.render('pages/group/form', {
      pageTitle : `Group Management - ${(isAdd) ? 'Add' : 'Edit'}`,
      item: item,
      errors: errors.array()
    });
  }
  
  if(isAdd){ // ADD
    var item = req.body;
    item['created'] = {
      user_id   : '',
      user_name : 'admin',
      time      : Date()
    };
    item['modified'] = {
      user_id   : '',
      user_name : 'admin',
      time      : Date()
    };
    await GroupModel.saveItem(item, {task : 'add'});

    req.flash('info', Notify.ADD_SUCCESS);
    res.redirect(linkIndex);
  }else { // Edit
    await GroupModel.saveItem(req.body, {task : 'edit'});

    await UserModel.saveItem({
      group_acp : {
        group_id : req.body.id,
        group_name : req.body.name
      }
    }, {task : 'update-group_acp'});
    
    req.flash('info', Notify.UPDATE_SUCCESS);
    res.redirect(linkIndex);
  }
});



/* GET users listing. */
router.get('/(:status)?', async function (req, res, next) {
  //var paramStatus = req.params.status;
  var currentParam = ParamsUtils.getParams(req.params, 'status', 'all');
  var textSearch = req.query.search;

  var filterStatus =  await FilterStatusUtils.filterStatus(currentParam, 'groups');

  //Xet Điều Kiện Sort
  var name_field = req.session.name_field || 'ordering';
  var type_sort =  req.session.type_sort   || 'asc';

  var querySort = {};
  querySort[name_field] = type_sort;

  //Xet Điều Kiện duyệt
  var queryGetItems = {};

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

  //Xu lý Pagination
  var currentPage = parseInt(req.query.page) || 1;
  var totalElement = await GroupModel.countItem(queryGetItems);

  //Xu lý Pagination
  var pagination = PaginationUtils(totalElement, currentPage, 9, 3);


  var items = await GroupModel.listItems(queryGetItems, querySort, pagination.elementPerPage, pagination.positionGetElement);

  res.render('pages/group/index', {
    pageTitle: "Group Management",
    items: items,
    filterStatus,
    textSearch,
    currentParam,
    pagination,
    messages: req.flash('info'),
    name_field,
    type_sort
  });
});

//Change Status
router.get('/change-status/(:id)/(:status)', async function (req, res, next) {
  
  var id = req.params.id || '';
  var status = req.params.status || 'active';
  status = (status !== 'active') ? 'active' : 'inactive';
  await GroupModel.changeStatus(id, status, {task : 'single'});

  req.flash('info', Notify.STATUS_SUCCESS);
  res.redirect(linkIndex);
});

//Multi Change Status
router.post('/change-status/(:status)', async function (req, res, next) {
  var setStatus = req.params.status || 'active';
  var countElemetChanged = await GroupModel.changeStatus(req.body.cid, setStatus, {task : 'multi'});

  req.flash('info', util.format(Notify.MULTI_STATUS_SUCCESS, countElemetChanged.n));
  res.redirect(linkIndex);
});

//Multi Delete Element
router.post('/delete/', async function (req, res, next) {
  var countElemetDeleted =  await GroupModel.deleteItems(req.body.cid, {task : 'multi'});
  req.flash('info', util.format(Notify.MULTI_DELETE_SUCCESS), countElemetDeleted.n);
  res.redirect(linkIndex);
});

//Delete Element
router.get('/delete/(:id)', async function (req, res, next) {
  var id = req.params.id || '';
 
  await GroupModel.deleteItems(id, {task : 'single'});

  req.flash('info', Notify.DELETE_SUCCESS);
  res.redirect(linkIndex);
});

//Multi Change Ordering
router.post('/save-ordering/', async function (req, res, next) {
  var arrID       = req.body.cid;
  var arrOrdering = req.body.ordering;
  if(!Array.isArray(arrID)){
    arrID = [arrID];
    arrOrdering = [arrOrdering];
  }

  await GroupModel.changeOrdering(arrID, arrOrdering);

  req.flash('info', util.format(Notify.MULTI_ORDERING_SUCCESS, arrID.length));
  res.redirect(linkIndex);
});


//Sort
router.get('/sort/:name_field/:type_sort', function (req, res, next) {
  req.session.name_field = req.params.name_field || 'ordering';
  req.session.type_sort = req.params.type_sort   || 'asc';

  res.redirect(linkIndex);
});

//Change Group_ACP
router.get('/change-group_acp/(:id)/(:value)', async function (req, res, next) {
  var id = req.params.id || '';
  var value = req.params.value || 'yes';
  value = (value !== 'yes') ? 'yes' : 'no';

  await GroupModel.saveItem({id: id,group_acp : value}, {task : "update-group-acp"})

  req.flash('info', Notify.GROUPACP_SUCCESS);
  res.redirect(linkIndex);
});



module.exports = router;