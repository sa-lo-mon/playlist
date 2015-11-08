/**
 * Created by ziv on 23/7/2015.
 */
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

MongoAccessLayer.prototype.batchInsert = function (collectionName, documentsArray, callback) {
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);

        } else {
            db.collection(collectionName).insert(documentsArray, function (err, result) {
                assert.equal(err, null);
                callback(null, result);
            });
        }
    });
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

MongoAccessLayer.prototype.getCollection = function (collectionName, query, callback) {
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            db.collection(collectionName).find(query, function (err, cursor) {
                assert.equal(err, null);
                cursor.toArray(function (err, items) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, items);
                    }
                });
            });
        }
    })
};

MongoAccessLayer.prototype.updateDocument = function (collectionName, criteria, callback) {
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);

        } else {
            db.collection(collectionName).update(criteria.condition, {$set: criteria.setValues},
                function (err, result) {
                    assert.equal(err, null);
                    callback(null, result);
                });
        }
    });
};

MongoAccessLayer.prototype.pushDocument = function (collectionName, criteria, callback) {
    this.connect(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            db.collection(collectionName).update(criteria.condition, {$push: criteria.setValues},
                function (err, result) {
                    assert.equal(err, null);
                    callback(null, result);
                });
        }
    });
};

MongoAccessLayer.prototype.getMySales = function (collectionName, value, callback) {
    var query = {"email": value};

    this.connect(function (err, db) {
        if (err) {
            callback(err, null);
        } else {
            db.collection(collectionName, function (err, collection) {
                assert.equal(err, null);
                collection.findOne(query, ['email', 'FirstName', 'Categories', 'Sales'], function (err, document) {
                    assert.equal(err, null);
                    callback(null, document);
                });
            });
        }
    })
};

var mongoAccessLayer = new MongoAccessLayer();
mongoAccessLayer.setup(config.mongoUrl);
module.exports = mongoAccessLayer;