'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');

/**
 * Finds a person by id if it exists.
 */
exports.person = function(req, res, next, id) {
    db.Person.find({where : { item_id: id },
      include: [{model: db.Involved, as: 'Involvements', include: [{
                      model: db.Movie, as: 'InvolvedMovies',
                      attributes: ['item_id', 'title', 'tmdb_rating'],
                    }], }],
      }).then(function(person){

        var personData = person.get();
        personData.movies = [];

        for (var k in personData.Involvements) {
          if (personData.Involvements.hasOwnProperty(k)) {
            var involved = personData.Involvements[k];
            var movie = involved.InvolvedMovies;

            personData.movies.push({"item_id": movie.item_id, "title" : movie.title,
              "tmdb_rating" : movie.tmdb_rating});
          }
        }

      // Sort the movies by tmdb rating
      personData.movies.sort(function (a, b) {
        return (a.tmdb_rating > b.tmdb_rating) ? -1 : ((a.tmdb_rating > b.tmdb_rating) ? 1 : 0);
      });

      if (!person) {
          return next(new Error('Failed to load person ' + id));
      }

      delete personData.Involvements;

      req.person = personData;
      next();
    }).catch(function(err){
      next(err);
    });
};

/**
 * Finds person involve related info given movie ids.
 */
exports.movie_involved = function(req, res, next) {

  var id = req.param('id');

  db.Involved.findAll({where : {movie_id : id},
    include: [{model: db.Person, as: 'InvolvedPeople', attributes: ['name']}],
  })
  .then(function(people) {
    res.jsonp(people);
  }).catch(function(err){
    next(err);
  });
};

/**
 * Show a person.
 */
exports.show = function(req, res) {
    res.jsonp(req.person);
};

/**
 * Gets all the information needed for visualization.
 */
exports.visualize = function(req, res) {

    // Get the person id
    var id = req.param('id');

    // Get the person by id, and fetch related entries at the same time.
    db.Person.find({where : { item_id: id },
        attributes: ['item_id', 'name', 'tmdb_id']}).then(function(person){
      if (!person) {
          return next(new Error('Failed to load person ' + id));
      }

      res.jsonp(person);
    }).catch(function(err){
      next(err);
    });
};

/**
 * Gets the id of a random person and redirects to that id.
 */
exports.random = function(req, res) {
  db.Person.find({order : [ sequelize.fn('RAND')], attributes: ['item_id']})
    .then(function(person){
      if (!person) {
          return next(new Error('No people to randomly select.'));
      }

      res.jsonp({id: person.item_id});
    }).catch(function(err){
      next(err);
    });
};
