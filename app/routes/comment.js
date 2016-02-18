'use strict';

/**
* Module dependencies.
*/
var user = require('../../app/controllers/user'),
    comment = require('../../app/controllers/comment');

module.exports = function(app) {
// Comment Routes

// Gets a subset of the comments for an item
app.get('/comment/item/list/:item_id/:offset/:limit', comment.item_list);

// Gets a subset of the comments for a user
app.get('/comment/user/list/:user_id/:offset/:limit', comment.user_list);

// Delete or update a comment.
app.route('/comment/:comment_id')
    .delete(user.requiresLogin, comment.hasAuthorization, comment.delete)
    .post(user.requiresLogin, comment.hasAuthorization, comment.update);

// Fetches a comment, don't use comment_id since we want more information (but
// the other routes should not do that)
app.get('/comment/:id', comment.show);

// Creates a comment
app.post('/comment', user.requiresLogin, comment.create);

// Load the comment if the comment_id appears in a parameter.
app.param('comment_id', comment.comment);
};

