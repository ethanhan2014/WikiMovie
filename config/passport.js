'use strict';

var passport = require('passport');
var _ = require('lodash');
// These are different types of authentication strategies that can be used with Passport.
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
var db = require('./sequelize');
var winston = require('./winston');

//Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
    db.User.find({where: {user_id: id}}).then(function(user){
        if(!user){
            winston.warn('Logged in user not in database, user possibly deleted post-login');
            return done(null, false);
        }
        winston.info('Session: { user_id: ' + user.user_id + ', username: ' + user.username + ' }');
        done(null, user);
    }).catch(function(err){
        done(err, null);
    });
});

//Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    db.User.find({ where: { email: email }}).then(function(user) {
      console.log(email + " "+password+" "+user+" "+done);
      if (!user) {
        console.log("Unknown user");
        done(null, false, { message: 'Unknown user' });
      } else if (!user.authenticate(password)) {
        console.log("Bad password");
        done(null, false, { message: 'Invalid password'});
      } else {
        winston.info('Login (local) : { user_id: ' + user.user_id + ', username: ' + user.username + ' }');
        done(null, user);
      }
    }).catch(function(err){
      done(err);
    });
  }
));

//    Use twitter strategy
passport.use(new TwitterStrategy({
        consumerKey: config.twitter.clientID,
        consumerSecret: config.twitter.clientSecret,
        callbackURL: config.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {

        db.User.find({where: {twitter_user_id: profile.id}}).then(function(user){
            if(!user){
                db.User.create({
                    twitter_user_id: profile.id,
                    name: profile.displayName,
                    username: profile.username,
                    provider: 'twitter'
                }).then(function(u){
                    winston.info('New User (twitter) : { id: ' + u.user_id + ', username: ' + u.username + ' }');
                    done(null, u);
                });
            } else {
                winston.info('Login (twitter) : { id: ' + user.user_id + ', username: ' + user.username + ' }');
                done(null, user);
            }

        }).catch(function(err){
            done(err, null);
        });
    }
));


// Use facebook strategy
passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {

        db.User.find({where : {facebook_user_id: profile.id}}).then(function(user){
            if(!user){
                db.User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.username,
                    provider: 'facebook',
                    facebook_user_id: profile.id
                }).then(function(u){
                    winston.info('New User (facebook) : { id: ' + u.user_id + ', username: ' + u.username + ' }');
                    done(null, u);
                })
            } else {
                winston.info('Login (facebook) : { id: ' + user.user_id + ', username: ' + user.username + ' }');
                done(null, user);
            }
        }).catch(function(err){
            done(err, null);
        });
    }
));

//Use google strategy
passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {

        db.User.find({where : {open_id: profile.id}}).then(function(user){
            if(!user){
                db.User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.username,
                    provider: 'google',
                    open_id: profile.id
                }).then(function(u){
                    winston.info('New User (google) : { id: ' + u.user_id + ', username: ' + u.username + ' }');
                    done(null, u);
                })
            } else {
                winston.info('Login (google) : { id: ' + user.user_id + ', username: ' + user.username + ' }');
                done(null, user);
            }
        }).catch(function(err){
            done(err, null);
        });
    }
));

module.exports = passport;

