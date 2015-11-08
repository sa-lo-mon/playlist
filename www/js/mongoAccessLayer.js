var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('./config');

function MongoAccessLayer() {
    this.url = Object.create(null);
    this.db = Object.create(null);
};

MongoAccessLayer.prototype.setup = function (url) {
    MongoAccessLayer.url = url;
};

MongoAccessLayer.prototype.connect = function (callback) {
    if (MongoAccessLayer.db == null || MongoAccessLayer.db == undefined) {
        MongoClient.connect(MongoAccessLayer.url, function (err, db) {
            assert.equal(null, err);
            MongoAccessLayer.db = db;
            callback(null, db);
        });

    } else {
        callback(null, MongoAccessLayer.db);
    }
};

MongoAccessLayer.prototype.findUser = function (collectionName, value, callback) {
    var query = {"email": value};
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            db.collection(collectionName, function (err, collection) {
                assert.equal(err, null);
                collection.findOne(query, ['email', 'FirstName', 'Password', 'Categories', 'Sales'], function (err, document) {
                    assert.equal(err, null);
                    callback(null, document);
                });
            });
        }
    })
};

MongoAccessLayer.prototype.insertDocument = function (collectionName, document, callback) {
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);

        } else {
            db.collection(collectionName).insertOne(document, function (err, result) {
                assert.equal(err, null);
                callback(null, result);
            });
        }
    });
};

MongoAccessLayer.prototype.validateUser = function (loginInput, callback) {

    //check user according to email
    this.findUser('users', loginInput.user_name, function (err, data) {

        if (err) callback(err, null);

        if (data && (loginInput.password == data.Password)) {
            callback(null, {valid: true, data: data});

        } else {

            //user doesn't exist or password is incorrect
            callback(null, {valid: false, data: null});
        }
    });
};

MongoAccessLayer.prototype.checkUser = function (user, callback) {

    //check user according to email
    this.findUser('users', user.email, function (err, data) {
        if (err)
            callback(err, null);

        if (data) {

            //user exist
            callback(null, data);
        } else {

            //user doesn't exist
            callback(null, null);
        }
    });
};

var mongoAccessLayer = new MongoAccessLayer();
mongoAccessLayer.setup(config.mongoUrl);
module.exports = mongoAccessLayer;
