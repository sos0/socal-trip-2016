'use strict';

var request = require('../config/request');

function makeRequest(url, method) {

  return function(req, callback) {
    request({url: url, method: method, form: req},
      function(err, res, body) {
        if (err) {
          callback(err);
        } else {
          switch (body.code) {
            default:
              callback(new Error('Backend returned an unexpected code: ' +
                                body.code + ': ' + body.message));
              return;
            case 500:

              callback(new Error(body.message));
              return;
            case 400:
              callback(null, new Error(body.message));
              return;
            case 200:
              callback(null, null, body);
              return;
          }
        }
      }
    );
  };
}

module.exports = {
  createUser: makeRequest('/user', 'POST'),
  deleteUser: makeRequest('/user', 'DELETE'),
  authenticateUser: makeRequest('/user/authenticate', 'POST'),
  reauthenticateUser: makeRequest('/user/reauthenticate', 'POST'),
  logoutUser: makeRequest('/user/logout', 'POST'),
  changeUserPassword: makeRequest('/user/password', 'PUT'),
  getMap: makeRequest('/map', 'GET'),
  createMarker: makeRequest('/map/marker', 'POST')
};
