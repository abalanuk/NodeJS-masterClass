const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
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
      for(let i=0; i<strLength; i++) {
        const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        str+=randomChar;
      }

      return str;
    }

    return false
  }


};

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback){
  // Validate parameters
  phone = typeof(phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
  msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

  if(phone && msg) {
      // Configure the request payload
      const payload = {
        "From": config.twilio.fromPhone,
        "To": phone,
        "Body": msg
      };

      const stringPayload = querystring.stringify(payload);
      // Configure the request details
      const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.twilio.com',
        'method': 'POST',
        'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
        'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
        'headers': {
             'Content-type': 'application/x-www-form-urlencoded',
             'Content-length': Buffer.byteLength(stringPayload)
         }
      };

      // Instantiate the request object
      let req = https.request(requestDetails, function(res){
        // Grab the status of sent request
        const status = res.statusCode;
        // Callback succesfully if the request went through
        if(status === 200 || status === 201){
          callback(false);
        } else {
          callback("Status code returned was: " + status);
        }

        // Bind to the error event so it doesn't get trown
        req.on('error', function(e){
          callback(e);
        });

        // Add the payload to the request
        req.write(stringPayload);

        // End the request
        req.end();
      });
  } else {
     callback("Giving params were missing or invalid");
  }
};

module.exports = helpers;
