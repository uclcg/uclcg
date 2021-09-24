//some libraries we need
var express = require('express');
var passport = require('passport');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/../public/html/index.html'));
});

router.post('/login',
    passport.authenticate('local', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/admin');
    });

router.get('/login', function (req, res) {
    res.redirect('/');
});

router.get('/admin',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.sendFile(path.join(__dirname, '/../public/html/admin.html'));
    });

router.get('/logout', function (req, res) {
    req.logout();
    //req.session.destroy();
    res.redirect('/');
});

router.use((req, res, next) => {
    next({
        status: 404,
        message: 'Not Found',
    });
});

router.use((err, req, res, next) => {

    if (err.status === 404) {
        res.sendFile(path.join(__dirname, '/../public/html/error.html'));
    }
});

module.exports = router;