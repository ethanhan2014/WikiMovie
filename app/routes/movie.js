'use strict';

/**
* Module dependencies.
*/
var movie = require('../../app/controllers/movie');

module.exports = function(app) {

app.route('/movie/random')
  .get(movie.random);

app.route('/movie/latest/:numLatest')
  .get(function(req, res) {
    movie.latest(req, res, req.param('numLatest'));
  });

app.route('/movie/:movieId')
    .get(movie.show);

// Finish with setting up the movieId param
// Note: the movie.movie function will be called everytime then it will call the next function.
app.param('movieId', movie.movie);
};

