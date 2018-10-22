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
  }
};

module.exports = helpers;
