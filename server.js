var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');
var config = require('./server/config.js');
var ss = require('socket.io-stream');
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);
var sessionMiddleware = require('./server/session.js');
var routes = require('./server/routes.js');
var db = require('./server/database.js');

app.use(require('serve-favicon')(path.join(__dirname, "favicon.ico")));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/experiments', express.static(path.join(__dirname, 'experiments')));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', routes);


/*
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

//Socket IO for setups
io.on('connection', function (socket) {

    try {
        var user = socket.request.session.passport.user;
    } catch(err) {
        var user = undefined;
    }


    socket.on('checkLoggedIn', function () {
        if (typeof(user) == 'undefined') {
            socket.emit('loggedOut', {});
        } else {
            socket.emit('loggedIn', {});
        }
    });

    // ##### SHOW ALL #####
    socket.on('getAllSetups', function (data) {
        //find all setups in the Database (no login required)
        db.setups.find(function (err, setups) {
            if (err) return console.error(err);
            socket.emit('returnAllSetups', JSON.stringify(setups));
        });
    });

    // ##### DELETE #####
    socket.on('deleteSetup', function (data) {
        //make sure the user is logged in
        if (typeof user == "undefined") {
            console.log('Non-authenticated connection refused.');
            socket.emit('unauthorized', {});
        }

        //find setup first
        db.setups.findById(data.id2delete, function (err, instance) {
            if (err) return console.error(err);
            if (instance == null) {
                console.log('ERROR: Cannot delete id: ' + data.id2delete);
                return;
            }
            //remember files
            var picPath = instance.picture;
            var jsPath = instance.jsFile;

            //delete the setup
            db.setups.findByIdAndRemove(data.id2delete, function (err) {
                //delete files on disk
                fs.unlink(picPath, function () {
                    fs.unlink(jsPath, function () {
                        console.log('Sucesfully deleted setup: ' + data.id2delete);
                        socket.emit('setupDeleteSuccessful', {});
                    });
                });
            });
        });
    });

    // ##### HIDE #####
    socket.on('hideSetup', function (data) {
        if (typeof user == "undefined") {
            console.log('Non-authenticated connection refused.');
            socket.emit('unauthorized', {});
        }

        db.setups.findById(data.id2hide, function (err, instance) {
            if (err) return console.error(err);
            instance.hidden = data.hide;
            instance.save(function (err, updatedInstance) {
                if (err) return console.error(err);
                //emit success msg
                console.log("Updated Setup:");
                console.log(updatedInstance);
            });
        });
    });


    // ##### ADD #####

    var isAdding = 0;
    var isAddingInner = 0;
    var filenamePicture;
    var metaData;

    ss(socket).on('addSetup', function (stream, data) {

        isAdding += 1;
        if (stream == null || isAdding > 1) {
            socket.emit('invalidStream', {});
            return;
        }
        //make sure the user is logged in
        if (typeof user == "undefined") {
            console.log('Non-authenticated connection refused.');
            socket.emit('unauthorized', {});
            return;
        }
        var currentTime = String(Date.now());
        metaData = JSON.parse(data);
        filenamePicture = 'public/experiments/images/' + user.username + '_' + currentTime + '.png';
        stream.pipe(fs.createWriteStream(filenamePicture));
        stream.on('end', function () {
            console.log("End: Requesting Js File");
            socket.emit('addSetupRequestJS');
        });
    });

    ss(socket).on('addSetupJS', function (stream1, dataNone) {
        isAddingInner += 1;
        if (stream1 == null || isAddingInner > 1) {
            socket.emit('invalidStream', {});
            return;
        }
        var currentTime = String(Date.now());
        var filenameJS = 'public/experiments/code/' + user.username + '_' + currentTime + '.js';
        stream1.pipe(fs.createWriteStream(filenameJS));
        //once uploaded, add to db and then return success event
        stream1.on('end', function () {
            //write to db
            var newSetup = new db.setups({
                jsFile: filenameJS,
                category: metaData.category,
                picture: filenamePicture,
                niceName: metaData.niceName,
                shortDescription: metaData.shortDescription,
                author: metaData.author
            });

            newSetup.save(function (err, newInstance) {
                if (err) return console.error(err);
                //emit success msg
                console.log("New Setup Added:");
                console.log(newInstance);
                socket.emit('addSetupSuccess');
                stream1.destroy();
                isAdding -= 1;
                isAddingInner -= 1;
            });
        });
    });

});*/

http.listen(config.port, function () {
    console.log('Example app listening on port:' + config.port);
});