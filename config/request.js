'use strict';

var request = require('request');

var API_VERSION = 'v1';

var API_PORT = process.env.API_PORT || 9000;

var baseUrl = 'http://localhost:' + API_PORT + '/' + API_VERSION;

module.exports = request.defaults({ json: true, baseUrl: baseUrl });
