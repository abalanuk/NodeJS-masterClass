/*
* Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

//Define the handlers
handlers = {
  ping: function(data, callback) {
    // callback a http status code and a payload object
    callback(200);
  },
  notFound: function(data, callback) {
    callback(404);
  },
  hello: function(data, callback) {
    callback(200, data);
  },
  users: function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();
    if(acceptableMethods.indexOf(method) > -1) {
      handlers._users[method](data, callback);
    } else {
      callback(405);
    }
  },
  tokens: function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();
    if(acceptableMethods.indexOf(method) > -1) {
      handlers._tokens[method](data, callback);
    } else {
      callback(405);
    }
  }
}

// Container for the users submethods
// Required data: firstName, lastName, phone, password, tosAgrrement
// optional data: none
handlers._users = {
  post: function(data, callback) {
      //Check that all required fileds are filled out
      const firstName = typeof(data.payload.firstName) == 'string' &&
      data.payload.firstName.trim().length > 0 ?
      data.payload.firstName.trim() : false;

      const lastName = typeof(data.payload.lastName) == 'string' &&
      data.payload.lastName.trim().length > 0 ?
      data.payload.lastName.trim() : false;

      const phone = typeof(data.payload.phone) == 'string' &&
      data.payload.phone.trim().length == 10 ?
      data.payload.phone.trim() : false;

      const password = typeof(data.payload.password) == 'string' &&
      data.payload.password.trim().length > 0 ?
      data.payload.password.trim() : false;

      const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' &&
      data.payload.tosAgreement ? true : false;

      if(firstName && lastName && password && phone && tosAgreement) {
          // Make sure that the user doesn't exist
          _data.read('users', phone, function(err, data){
              if(!err){
                callback(400, {'Error': 'User is already exists'})
                return
              }

              // Hash the password
              const hashedPassword = helpers.hash(password);

              if(hashedPassword) {
                  const userObject = {
                    firstName,
                    lastName,
                    phone,
                    hashedPassword,
                    tosAgreement
                  };
                  _data.create(
                    'users',
                    phone,
                    userObject,
                    function(err){
                      if(err) {
                        console.log(err);
                        callback(500, {'Error': 'Could not create the new user'});
                        return
                      }

                      callback(200);
                    }
                  );
              } else {
                callback(500, {'Error': 'Could not hash user password'});
              }
          });
      } else {
          callback('400', {'Error': 'Missing required fields'});
      }
  },
  // Required data: phone
  // optional data: none
  //@TODO only let an authenticated user access their object
  get: function(data, callback) {
      const phone = typeof(data.query.phone) == 'string' &&
      data.query.phone.trim().length == 10 ?
      data.query.phone.trim() : false

      if(phone) {
          _data.read('users', phone, function(err, data){
              if(!err && data){
                delete data.hashedPassword;
                callback(200, data);
                return
              }
              callback(404);
        });
        return
     }
     callback('400', {'Error': 'Missing required field'});
  },
  // Required data: phone
  // optional data: firstName, lastName, password(at least one should be specified)
  //@TODO only let an authenticated user update their object
  put: function(data, callback) {
    const phone = typeof(data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false

    // Check optional fields
    const firstName = typeof(data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;

    const lastName = typeof(data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;

    const password = typeof(data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(!phone) {
      callback(400, {"Error": "Missing required field"});
      return
    }
    if(firstName || lastName || password) {
        _data.read('users', phone, function(err, data){
            if(!err && data){
              if(firstName) {
                data.firstName = firstName;
              }
              if(lastName) {
                data.lastName = lastName;
              }
              if(password) {
                data.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', phone, data, function(err){
                if(err){
                  console.log(err);
                  callback(500, {"Error": "Could not update the user"});
                  return
                }
                callback(200);
              });
              callback(200, data);
              return
            }
            callback(400, {"Error": "The specified user does not exists"});
      });
      return
    }
    callback(400, {"Error": ""});
  },
  // Required data: phone
  //@TODO only let an authenticated user delete their object
  //@TODO delete any other data related to user
  delete: function(data, callback) {
    const phone = typeof(data.query.phone) == 'string' &&
    data.query.phone.trim().length == 10 ?
    data.query.phone.trim() : false

    if(phone) {
        _data.read('users', phone, function(err, data){
            if(!err && data){
              _data.delete('users', phone, function(err){
                if(err){
                  callback(400, {"Error": "Could not delete specified user"});
                  return
                }
                callback(200);
              });
              return
            }
            callback(400, {"Error": "Could not find specified user"});
      });
      return
   }
   callback('400', {'Error': 'Missing required field'});
  }
}

// Container for all the tokens methods
// Required data: phone, password
// optional data: none
handlers._tokens = {
  post: function(data, callback) {
      //Check that all required fileds are filled out
      const phone = typeof(data.payload.phone) == 'string' &&
      data.payload.phone.trim().length == 10 ?
      data.payload.phone.trim() : false;

      const password = typeof(data.payload.password) == 'string' &&
      data.payload.password.trim().length > 0 ?
      data.payload.password.trim() : false;

      console.log(password, phone);
      if(password && phone) {
          // Lookup the user who matches that phone number
          _data.read('users', phone, function(err, data){
              if(err){
                callback(400, {'Error': 'Could not find the specified user'})
                return
              }

              // Hash the sent password and compare it to the password stored in the user object
              const hashedPassword = helpers.hash(password);

              if(hashedPassword === data.hashedPassword) {
                // Create a new token with a random name. Set expiration date 1 hour in the future
                const tokenId = helpers.createRandomString(20);
                const expiresIn = Date.now() + 1000 * 60 * 60;

                  const tokenObject = {
                    'phone': phone,
                    'id': tokenId,
                    'expiresIn': expiresIn
                  };
                  // Store the token
                  _data.create(
                    'tokens',
                    tokenId,
                    tokenObject,
                    function(err){
                      if(err) {
                        callback(500, {'Error': 'Could not create the new token'});
                        return
                      }
                      callback(200, tokenObject);
                    }
                  );
              } else {
                callback(400, {'Error': 'Password did not match the specified user stored password'});
              }
          });
      } else {
          callback('400', {'Error': 'Missing required fields'});
      }
  },
  // Required data: phone, password
  // optional data: none
  //@TODO only let an authenticated user access their object
  get: function(data, callback) {
      const phone = typeof(data.query.phone) == 'string' &&
      data.query.phone.trim().length == 10 ?
      data.query.phone.trim() : false

      if(phone) {
          _data.read('users', phone, function(err, data){
              if(!err && data){
                delete data.hashedPassword;
                callback(200, data);
                return
              }
              callback(404);
        });
        return
     }
     callback('400', {'Error': 'Missing required field'});
  },
  // Required data: phone
  // optional data: firstName, lastName, password(at least one should be specified)
  //@TODO only let an authenticated user update their object
  put: function(data, callback) {
    const phone = typeof(data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false

    // Check optional fields
    const firstName = typeof(data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;

    const lastName = typeof(data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;

    const password = typeof(data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(!phone) {
      callback(400, {"Error": "Missing required field"});
      return
    }
    if(firstName || lastName || password) {
        _data.read('users', phone, function(err, data){
            if(!err && data){
              if(firstName) {
                data.firstName = firstName;
              }
              if(lastName) {
                data.lastName = lastName;
              }
              if(password) {
                data.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', phone, data, function(err){
                if(err){
                  console.log(err);
                  callback(500, {"Error": "Could not update the user"});
                  return
                }
                callback(200);
              });
              callback(200, data);
              return
            }
            callback(400, {"Error": "The specified user does not exists"});
      });
      return
    }
    callback(400, {"Error": ""});
  },
  // Required data: phone
  //@TODO only let an authenticated user delete their object
  //@TODO delete any other data related to user
  delete: function(data, callback) {
    const phone = typeof(data.query.phone) == 'string' &&
    data.query.phone.trim().length == 10 ?
    data.query.phone.trim() : false

    if(phone) {
        _data.read('users', phone, function(err, data){
            if(!err && data){
              _data.delete('users', phone, function(err){
                if(err){
                  callback(400, {"Error": "Could not delete specified user"});
                  return
                }
                callback(200);
              });
              return
            }
            callback(400, {"Error": "Could not find specified user"});
      });
      return
   }
   callback('400', {'Error': 'Missing required field'});
  }
}

// Export the module
module.exports = handlers;
