var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');
var config = require('./config.js');

var setupSchema = new Schema({
    jsFile:  String,
    category: String,
    picture: String,
    niceName: String,
    shortDescription: String,
    created: { type: Date, default: Date.now },
    author: String,
    hidden: {type: Boolean, default: false }
});

var setups = mongoose.model('setups', setupSchema);

mongoose.connect(config.database.path, {useNewUrlParser: true}, function(err, db) {
    if (err) {
        console.log("Could not connect to db");
        throw err;
    }

/*    db.collection(" setups").drop(function(err, delOK) {
        if (err) throw err;
        if (delOK) console.log("Collection deleted");
        db.close();
    });*/

    console.log("Connected to db");
});




module.exports = {
    setups: setups,
    connection: mongoose.connection
};