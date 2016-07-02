'use strict';

var CookieConfig = {};

CookieConfig.options ={
  secure  : false,
  httpOnly: true,
  signed  : true
};

CookieConfig.secret = process.env.cookieSecret ||
                      'https://youtu.be/8qMtsir0l9k';

module.exports = CookieConfig;
