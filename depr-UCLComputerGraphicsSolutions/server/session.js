var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config.js');
var expressSession = require('express-session');


passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
        session: true
    },
    function (req, username, password, done) {
        if (config.user.username == username && config.user.password == password) {
            return done(null, config.user);
        }

        return done(null, false);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

var sessionMiddleware = require('express-session')({
    name: 'authCookie',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new (require("connect-mongo")(expressSession))({
        url: config.database.path
    })
});

module.exports = sessionMiddleware;



