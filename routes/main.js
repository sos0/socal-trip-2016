'use strict';

var API = require('../models/api');
var CookieConfig = require('../config/cookie');

module.exports = function(app, io) {

  function renderSplash(req, res) {
    if (req.signedCookies.token) {
      res.redirect('/home');
    } else {
      res.render('splash.html', {title: 'Welcome to Daze!'});
    }
  }

  function renderMap(req, res) {
    API.getMap({}, function(err, clientErr, _res) {
      res.render('index.html', {
        title: 'Home :: Daze',
        isLoggedIn: (req.signedCookies.token ? true : false)
      });

    });
  }

  function handleUserLogin(req, res) {
    API.authenticateUser(req.body, function(err, clientErr, _res) {

      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else if (clientErr) {
        res.status(400).send(clientErr.message);
      } else {
        var options = CookieConfig.options;
        options.maxAge = _res.ttl;
        res.cookie('token', _res.token, options);
        res.redirect('/home');
      }

    });
  }

  function handleUserSignup(req, res) {

    API.createUser(req.body, function(err, clientErr, _res) {

      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else if (clientErr) {
        res.status(400).send(clientErr.message);
      } else {
        var options = CookieConfig.options;
        options.maxAge = _res.ttl;
        res.cookie('token', _res.token, options);
        res.send(200);
      }

    });
  }

  function handleAddMarker(req, res) {

    var data = req.body;
    data.token = req.signedCookies.token;
    API.createMarker(req.body, function(err, clientErr, _res) {

      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else if (clientErr) {
        res.status(400).send(clientErr.message);
      } else {
        io.emit('new marker', _res.marker);
        res.sendStatus(200);
      }

    });
  }

  function handleUserLogout(req, res) {
    if (req.signedCookies.token) {
      API.logoutUser({token: req.signedCookies.token},
        function(err, clientErr, _res) {

          if (err) {
            console.error(err);

            //res.status(500).send(err.message);
          } else if (clientErr) {

            //res.status(400).send(clientErr.message);
          } else {
            //res.clearCookie('token');
            //res.status(200).send();
          }
          res.clearCookie('token');
          res.redirect('/');
      }
    );
    } else {
      res.send('You are not logged in!');
    }
  }


    io.on('connection', function(socket) {

      API.getMap({}, function(err, clientErr, _res) {

        socket.emit('initialize', _res.markers);

      });

      socket.on('marker', function(obj) {
        console.log('received marker obj: ' + obj);
      });

      socket.on('onlineUsers', function(num) {
        console.log('online users: ' + num);
      });

      socket.on('disconnect', function() {
        console.log('user disconnected.');
      });
    });

    app.get('/', renderSplash);
    app.get('/home', renderMap);
    app.get('/logout', handleUserLogout);
    app.post('/login', handleUserLogin);
    app.post('/join', handleUserSignup);
    app.post('/addmarker', handleAddMarker);
};
