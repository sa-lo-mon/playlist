var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoAccessLayer = require('./www/js/mongoAccessLayer.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/www'));

app.post('/api/login', function (req, res) {

  if (req.body.password && req.body.email) {

    var loginInput = {
      user_name: req.body.email,
      password: req.body.password
    };

    mongoAccessLayer.validateUser(loginInput, function (err, data) {
      if (err) {

        res.json({success: false, data: null, message: err.message});

      } else if (data && data.valid) {

        res.json({success: true, data: data});

      } else {

        //user not exist or password is incorrect
        res.json({success: false, data: null, message: 'Please check your input!'});
      }
    });

  } else {

    res.json({success: false, data: null, message: "Invalid Request!"});
  }
});

app.post('/api/register/complete', function (req, res) {
  var userDocument = {
    "FirstName": req.body.firstname,
    "LastName": req.body.lastname,
    "email": req.body.email,
    "Password": req.body.password,
    "birthyear": req.body.birthyear,
    "city": req.body.city,
    "gender": req.body.gender
  };

  facebookToDB.checkUser(userDocument, function (err, data) {
    if (err) {
      res.send('check user - error!!');
    } else if (data) {
      res.send('User with same email already exist!');
    } else {
      mongoAccessLayer.insertDocument('users', userDocument, function (err, data) {
        if (err) {
          res.send('error while registration!');
        } else {
          res.send('registration ended successfully!');
        }
      });
    }
  });
});

var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});
