'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');

// Fetches a comment (already loaded)
exports.show = function(req, res) {

  var id = req.param('id');

  db.Comment.find({ where: {comment_id: id},
    include: [{model: db.Item, as: 'Subject'}]}).then(function(comment) {
    if (!comment) {
      return next(new Error('Failed to load comment ' + id));
    } else {
      res.jsonp(comment);
    }
  }).catch(function(err) {
    return next(err);
  });
}

// Gets a subset of the comments for an item
exports.item_list = function(req, res) {

  var id = req.param('item_id');
  var offset = req.param('offset');
  var limit = req.param('limit');

  db.Comment.findAndCountAll({where: {item_id : id},
      include: [{model: db.User, as: 'Author', attributes: ['name', 'username', 'user_id']}],
      offset: offset,
      limit: limit,
      order: [ [ 'timestamp', 'DESC']] }).then(function(comments) {
        return res.jsonp({rows: comments.rows, count: comments.count });
    }).catch(function(err){
        return res.render('500', {
            error: err,
            status: 500
        });
    });
};

// Gets a subset of the comments for a user
exports.user_list = function(req, res) {

  var id = req.param('user_id');
  var offset = req.param('offset');
  var limit = req.param('limit');

  db.Comment.findAndCountAll({where: {user_id : id},
      include: [{model: db.User, as: 'Author', attributes: ['user_id']},
        {model: db.Item, as: 'Subject'}],
      offset: offset,
      limit: limit,
      order: [ [ 'timestamp', 'DESC']] }).then(function(comments) {
        return res.jsonp({rows: comments.rows, count: comments.count});
    }).catch(function(err){
        return res.render('500', {
            error: err,
            status: 500
        });
    });
};

// Delete a comment.
exports.delete = function(req, res, id) {
  var comment = req.comment;

  comment.destroy().then(function() {
    return res.jsonp(comment);
  }).catch(function(err) {
    return res.render('error', {
      error: err,
      status: 500
    });
  });
};

// Updates a comment.
exports.update = function(req, res, next) {

  var comment = req.comment;

  comment.updateAttributes({
    content: req.body.content,
    timestamp: sequelize.fn('NOW')
  }).then(function(val) {
    return res.jsonp(val);
  }).catch(function(a) {
      console.log(a);
    return res.render('error', {
      error: err,
      status: 500
    });
  });

};

// Creates a comment
exports.create = function(req, res) {

  // Get the user id
  req.body.user_id = req.user.user_id;
  req.body.timestamp = sequelize.fn("NOW");


  db.Comment.create(req.body).then(function(comment) {
    if (!comment) {
      return res.send('/', {errors: new StandardError('Comment could not be created')});
    } else {
      return res.jsonp(comment);
    }
  }).catch(function(err) {
    return res.send('/', {
      errors: err,
      status: 500
    });
  });

};

// Loads a comment
exports.comment = function(req, res, next, id) {

  db.Comment.find({ where: {comment_id: id}}).then(function(comment) {
    if (!comment) {
      return next(new Error('Failed to load comment ' + id));
    } else {
      req.comment = comment;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });
};

// Checks if the user has authorization
exports.hasAuthorization = function(req, res, next) {
  if (req.comment.user_id !== req.user.user_id) {
    return res.send(401, 'User is not the owner of the comment');
  }
  next();
};


