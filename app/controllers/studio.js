'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');

/**
 * Finds a studio by id if it exists.
 */
exports.studio = function(req, res, next, id) {
    db.Studio.find({where : { item_id: id },
      include: [{model: db.Movie, as: 'CreatedMovies', attributes: ['item_id', 'title']}],
      order: [ [{model: db.Movie, as: 'CreatedMovies'}, 'tmdb_rating', 'DESC']],
      }).then(function(studio){

        var studioData = studio.get();
        studioData.movies = [];

        // Get the top 25 movies
        var movies = studioData.CreatedMovies.slice(0, 25);
        for (var k in movies)
        {
          var obj = movies[k];
          studioData.movies.push({"title": obj.title, "item_id": obj.item_id});
        }
        delete studioData.CreatedMovies;
      if (!studio) {
          return next(new Error('Failed to load studio ' + id));
      }

      req.studio = studioData;
      next();
    }).catch(function(err){
      next(err);
    });
};

/**
 * Finds creator related info given a movie id.
 */
exports.movie_create = function(req, res, next) {

  var id = req.param('id');

  db.Studio.findAll({
    include: [{model: db.Movie, as: 'CreatedMovies', where: {item_id : id}, attributes: ['item_id']}]})
  .then(function(studio) {
    res.jsonp(studio);
  }).catch(function(err){
    next(err);
  });
};


/**
 * Gets the id of a random studio and redirects to that id.
 */
exports.random = function(req, res) {
  db.Studio.find({order : [ sequelize.fn('RAND')], attributes: ['item_id']})
    .then(function(studio){
      if (!studio) {
          return next(new Error('No studios to randomly select.'));
      }

      res.jsonp({id: studio.item_id});
    }).catch(function(err){
      next(err);
    });
};

/**
 * Show a studio.
 */
exports.show = function(req, res) {
    res.jsonp(req.studio);
};
