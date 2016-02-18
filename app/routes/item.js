'use strict';

/**
* Module dependencies.
*/
var item = require('../../app/controllers/item');

module.exports = function(app) {

app.route('/item/:itemId')
    .get(item.show);

// Finish with setting up the itemId param
// Note: the item.item function will be called everytime then it will call the next function.
app.param('itemId', item.item);
};

