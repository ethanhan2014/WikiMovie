'use strict';

/**
* Module dependencies.
*/
var person = require('../../app/controllers/person');

module.exports = function(app) {

app.route('/person/random')
  .get(person.random);

app.route('/person/:personId')
    .get(person.show);

// Don't want to load all the data, just fetch the ids and the name
app.route('/person/visualize/:id')
    .get(person.visualize);

app.route('/person/movie_involved/:id')
  .get(person.movie_involved);

// Finish with setting up the personId param
// Note: the person.person function will be called everytime then it will call the next function.
app.param('personId', person.person);
};

