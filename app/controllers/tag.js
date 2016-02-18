'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');
/**
 * Returns a list of the top tags given a limit.
 */
exports.list = function(req, res, next) {

  var limit = req.param('limit');

  db.Tag.findAll({
    order: [['gen_count', 'DESC']],
    limit: limit,
  }).then(function(results) {
    res.jsonp(results);
  }).catch(function(err){
      return res.render('500', {
          error: err,
          status: 500
      });
  });
};

// Gets movies containing the tag.
exports.browse = function(req, res) {

  var tag = req.param('tag');
  var offset = req.param('offset');
  var limit = req.param('limit');

  // Strangely enough you need to use the join table instead
  db.Tag_Belongs.findAndCountAll({
    include: [{model: db.Movie, attributes: ['item_id', 'title', 'image_url', 'description',
      'release_date', 'duration', 'tmdb_rating']}],
    where: { tag_id: tag},
    offset: offset,
    limit: limit,
    order: [['relevance', 'DESC'], [db.Movie, 'tmdb_rating', 'DESC']],
  })
  .then(function(result) {
    res.jsonp({ rows: result.rows, count: result.count });
  });

};

// Gets the name of a tag given its id.
exports.name = function(req, res) {
  var tag = req.param('tag');

  db.Tag.find({
    where: { tag_id: tag }
  })
  .then(function(result) {
    res.jsonp(result);
  });
};

/**
 * Finds movies with a given tag id.
 */
exports.movie_tag = function(req, res, next) {

  var id = req.param('id');

  db.Tag.findAll({
    include: [{model: db.Movie, as: 'Tagged', where: {item_id : id}, attributes: ['item_id']}],
    order: [[{model: db.Movie, as: 'Tagged'}, db.Tag_Belongs, 'relevance', 'DESC']],
    })
  .then(function(tags) {
    // For whatever reason, limit doesn't work with eager loading where condition
    // so just slice it here
    res.jsonp(tags.slice(0,10));
  }).catch(function(err){
    next(err);
  });
};
