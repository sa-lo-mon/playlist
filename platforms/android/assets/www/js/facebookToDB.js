/**
 * Created by ziv on 26/7/2015.
 */
var mongoAccessLayer = require('./mongoAccessLayer.js');

function FacebookToDB() {
};

FacebookToDB.prototype.validateUser = function (loginInput, callback) {

    //check user according to email
    mongoAccessLayer.findUser('users', loginInput.user_name, function (err, data) {

        if (err) callback(err, null);

        if (data && (loginInput.password == data.Password)) {
            callback(null, {valid: true, data: data});

        } else {

            //user doesn't exist or password is incorrect
            callback(null, {valid: false, data: null});
        }
    });
};

FacebookToDB.prototype.checkUser = function (user, callback) {

    //check user according to email
    mongoAccessLayer.findUser('users', user.email, function (err, data) {
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

FacebookToDB.prototype.insertUser = function (user, callback) {
    if (user == undefined || user == null) {
        callback(new EventException('user can not be null'), null);

    } else {
        var document = {
            "FirstName": user.first_name,
            "LastName": user.last_name,
            "email": user.email,
            "UserId": user.id
        };

        mongoAccessLayer.insertDocument('users', document, function (err, data) {
            if (err) {
                callback(err, null);
            } else {

                callback(null, {"FirstName": user.first_name, "email": user.email});
            }
        });
    }
};

var facebookToDB = new FacebookToDB();
module.exports = facebookToDB;