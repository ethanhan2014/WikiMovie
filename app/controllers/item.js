'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');


/**
 * Finds an item by id if it exists.
 */
exports.item = function(req, res, next, id) {

  db.Item.find({where : {item_id : id }}).then(function(item){
    if (!item) {
      return next(new Error('Failed to load item ' + id));
    }

    req.item = item;
    next();
  }).catch(function(err){
      next(err);
  });
};

/**
 * Show a item.
 */
exports.show = function(req, res) {
  res.jsonp(req.item);
};
