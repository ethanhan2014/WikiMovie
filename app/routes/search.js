'use strict';

/**
* Module dependencies.
*/
var search = require('../../app/controllers/search');

module.exports = function(app) {


app.route('/search/person/:query/:offset/:limit')
  .get(function(req, res) {
    search.person(req, res, req.param('query'), req.param('offset'), req.param('limit'));
  });

app.route('/search/movie/:query/:offset/:limit')
  .get(function(req, res) {
    search.movie(req, res, req.param('query'), req.param('offset'), req.param('limit'));
  });

app.route('/autocomplete/person/:query/:limit')
  .get(function(req, res) {
    search.autocomplete_person(req, res, req.param('query'), req.param('limit'));
  });

app.route('/autocomplete/movie/:query/:limit')
  .get(function(req, res) {
    search.autocomplete_movie(req, res, req.param('query'), req.param('limit'));
  });

};
