'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');

/**
 * Finds a movie by id if it exists.
 */
exports.movie = function(req, res, next, id) {

  var id = req.param('movieId');

    db.Movie.find({where : {item_id : id}})
    .then(function(movie) {
      if (!movie) {
        return next(new Error('Failed to load movie ' + id));
      }
      req.movie = movie;
      next();
    }).catch(function(err){
      next(err);
    });
};

/**
 * Gets the id of a random movie and redirects to that id.
 */
exports.random = function(req, res) {
  db.Movie.find({order : [ sequelize.fn('RAND')], attributes: ['item_id']})
    .then(function(movie){
      if (!movie) {
          return next(new Error('No movies to randomly select.'));
      }

      res.jsonp({id: movie.item_id});
    }).catch(function(err){
      next(err);
    });
};

/**
 * Gets the latest movies.
 */
exports.latest = function(req, res, num) {
  db.Movie.findAll({order: [ ['release_date', 'DESC'] ], limit: num,
    attributes: ['item_id', 'title', 'image_url'] })
    .then(function(movies) {
      if (!movies) {
        return next(new Error('No movies to retrieve.'));
      }

      res.jsonp(movies);
    }).catch(function(err){
      next(err);
    });
};

/**
 * Show a movie.
 */
exports.show = function(req, res) {
  res.jsonp(req.movie);
};
