const crypto = require('crypto');
const config = require('../config');

const helpers = {
  // Create a SHA256 hash
  hash: function(str){
    if(typeof(str) == 'string' && str.length > 0){
      return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    }
    return false
  },
  parseJsonToObject: function(str){
    // To not throw anything
    try {
      return JSON.parse(str);
    } catch(e) {
      return {};
    }
  },
  createRandomString: function(strLength){
    strLength = typeof(strLength) === 'number' && strLength > 10 ? strLength : false;

    if(strLength) {
      // define all the possible characters
      const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

      let str = '';
      for(let i=1; i<strLength; i++) {
        const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        str+=randomChar;
      }

      return str;
    }

    return false
  }
};

module.exports = helpers;
