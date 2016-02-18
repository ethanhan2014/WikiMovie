'use strict';

/**
* Module dependencies.
*/
var tag = require('../../app/controllers/tag');

module.exports = function(app) {

app.route('/tag/list/:limit').get(tag.list);

app.route('/tag/browse/:tag/:offset/:limit').get(tag.browse);

app.route('/tag/name/:tag').get(tag.name);

app.route('/tag/movie_tag/:id').get(tag.movie_tag);

};
