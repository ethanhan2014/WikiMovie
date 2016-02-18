'use strict';

/**
* Module dependencies.
*/
var passport = require('passport');

module.exports = function(app) {
// User Routes
var user = require('../../app/controllers/user');

// User Routes
app.get('/signin', user.signin);
app.get('/signup', user.signup);
app.get('/signout', user.signout);
app.get('/user/me', user.me);

// Setting up the users api
app.post('/user', user.create);

// Setting the local strategy route
app.post('/user/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
}), user.session);

// Setting the facebook oauth routes
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email', 'user_about_me'],
    failureRedirect: '/signin'
}), user.signin);

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
}), user.authCallback);

// Setting the twitter oauth routes
app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
}), user.signin);

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
}), user.authCallback);

// Setting the google oauth routes
app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}), user.signin);

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
}), user.authCallback);

app.get('/user/:userId/profile', user.profile);

// Finish with setting up the userId param
app.param('userId', user.user);
};

