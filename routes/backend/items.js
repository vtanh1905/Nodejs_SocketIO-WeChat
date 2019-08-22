var express = require('express');
var ItemModel = require('./../../model/item_model');
var FilterStatusUtils =  require('.1/../../helpers/filterStatus');
var ParamsUtils = require('./../../helpers/params');
var PaginationUtils = require('./../../helpers/pagination');
var SystemConfig = require('./../../config/system');
var Notify = require('./../../config/notify');
var ItemValidator = require('./../../validator/item_validator');
const util = require('util');
var linkIndex = `/${SystemConfig.prefixAdmin}/items`;
const { check, validationResult } = require('express-validator');

var router = express.Router();

router.get('/form(/:id)?', async function (req, res, next) {
  var id = req.params.id || '';
  var pageTitle = 'Item Management - ';
  var item = [{ordering : 0}];
  if(id === ''){
    pageTitle += 'Add';
  }else {
    pageTitle += 'Edit';
    item = await ItemModel.getItemByID(id);
  }
  
  res.render('pages/list/form', {
    pageTitle,
    item: item[0],
    errors: null
  });
});

router.post('/form/save', ItemValidator , async function (req, res, next) {
  var isAdd = (req.body.id) ? false : true;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var item = req.body;
    
    return res.render('pages/list/form', {
      pageTitle : `Item Management - ${(isAdd) ? 'Add' : 'Edit'}`,
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

    await ItemModel.saveItem(item, {task : 'add'});

    req.flash('info', Notify.ADD_SUCCESS);
    res.redirect(linkIndex);
  }else { // Edit
    await ItemModel.saveItem(req.body, {task : 'edit'});
    
    req.flash('info', Notify.UPDATE_SUCCESS);
    res.redirect(linkIndex);
  }
});



/* GET users listing. */
router.get('/(:status)?', async function (req, res, next) {
  //var paramStatus = req.params.status;
  var currentParam = ParamsUtils.getParams(req.params, 'status', 'all');
  var textSearch = req.query.search;

  var filterStatus = await FilterStatusUtils.filterStatus(currentParam, 'items');

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
  var totalElement = await ItemModel.countItem(queryGetItems);

  //Xu lý Pagination
  var pagination = PaginationUtils(totalElement, currentPage, 9, 3);

  var items = await ItemModel.listItems(queryGetItems, querySort, pagination.elementPerPage, pagination.positionGetElement);
  
  res.render('pages/list/index', {
    pageTitle: "Item Management",
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
  await ItemModel.changeStatus(id, status, {task : 'single'});

  req.flash('info', Notify.STATUS_SUCCESS);
  res.redirect(linkIndex);
  
});

//Multi Change Status
router.post('/change-status/(:status)', async function (req, res, next) {
  var setStatus = req.params.status || 'active';

  var countElemetChanged = await ItemModel.changeStatus(req.body.cid, setStatus, {task : 'multi'});

  req.flash('info', util.format(Notify.MULTI_STATUS_SUCCESS, countElemetChanged.n));
  res.redirect(linkIndex);
});

//Multi Delete Element
router.post('/delete/', async function (req, res, next) {
  var countElemetDeleted =  await ItemModel.deleteItems(req.body.cid, {task : 'multi'});
  req.flash('info', util.format(Notify.MULTI_DELETE_SUCCESS), countElemetDeleted.n);
  res.redirect(linkIndex);
});

//Delete Element
router.get('/delete/(:id)', async function (req, res, next) {
  var id = req.params.id || '';
 
  await ItemModel.deleteItems(id, {task : 'single'});

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

  await ItemModel.changeOrdering(arrID, arrOrdering);

  req.flash('info', util.format(Notify.MULTI_ORDERING_SUCCESS, arrID.length));
  res.redirect(linkIndex);
});


//Sort
router.get('/sort/:name_field/:type_sort', function (req, res, next) {
  req.session.name_field = req.params.name_field || 'ordering';
  req.session.type_sort = req.params.type_sort   || 'asc';

  res.redirect(linkIndex);
});





module.exports = router;