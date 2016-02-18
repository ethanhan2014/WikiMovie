'use strict';

/**
* Module dependencies.
*/
var studio = require('../../app/controllers/studio');

module.exports = function(app) {


app.route('/studio/random')
  .get(studio.random);


app.route('/studio/:studioId')
  .get(studio.show);

app.route('/studio/movie_create/:id')
  .get(studio.movie_create);

// Finish with setting up the studioId param
// Note: the studio.studio function will be called everytime then it will call the next function.
app.param('studioId', studio.studio);
};

