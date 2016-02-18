'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize'),
  sequelize = require('sequelize');

/**
 * Searches for people given a query an offset and a limit.
 */
exports.person = function(req, res, query, offset, limit) {

  db.Person.findAndCountAll({
     where: ['MATCH(name) AGAINST(?)', query],
     offset: offset,
     limit: limit,
     attributes: ['item_id', 'image_url', 'name','birth_date','biography'],
     order: [ [sequelize.fn('MATCH(name) AGAINST', query), 'DESC'] ],
  })
  .then(function(result) {
    res.jsonp({ rows: result.rows, count: result.count });
  });
};

/**
 * Autocomplete the name of a person.
 */
exports.autocomplete_person = function(req, res, query, limit) {

  db.Person.findAll({
     where: ['MATCH(name) AGAINST(? IN BOOLEAN MODE)', query+"*"],
     attributes: ['name'],
     limit: limit,
  })
  .then(function(results) {
      res.jsonp(results.map(function(x) { return x.name; }));
  });
};

/**
 * Autocomplete the name of a movie.
 */
exports.autocomplete_movie = function(req, res, query, limit) {

  db.Movie.findAll({
     where: ['MATCH(title) AGAINST(? IN BOOLEAN MODE)', query+"*"],
     attributes: ['title'],
     limit: limit,
  })
  .then(function(results) {
    res.jsonp(results.map(function(x) { return x.title; }));
  });
};

/**
 * Searches for movies given a query an offset and a limit.
 */
exports.movie = function(req, res, query, offset, limit) {
    db.Movie.findAndCountAll({
     where: ['MATCH(title) AGAINST(?)', query],
     offset: offset,
     limit: limit,
     // ['title', 'name'] renames title to name.
     attributes: ['item_id', 'image_url', ['title', 'name'], 'duration', 'description', 'release_date', 'tmdb_rating'],
     order: [ [sequelize.fn('MATCH(title) AGAINST', query), 'DESC'],
     // In the event of duplicate relevance, sort by rating.
      ['tmdb_rating', 'DESC'] ],
  })
  .then(function(result) {
    res.jsonp({ rows: result.rows, count: result.count });
  });
};
