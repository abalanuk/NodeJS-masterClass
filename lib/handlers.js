/*
* Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('../config');

//Define the handlers
let handlers = {
  ping: function(data, callback) {
    // callback a http status code and a payload object
    callback(200);
  },
  notFound: function(data, callback) {
    callback(404);
  },
  hello: function(data, callback) {
    callback(200, { "greeting" : "Hello, let's write some cool code" });
  },
  users: function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();
    if(acceptableMethods.includes(method)) {
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
  },
  checks: function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    const method = data.method.toLowerCase();
    if(acceptableMethods.indexOf(method) > -1) {
      handlers._checks[method](data, callback);
    } else {
      callback(405);
    }
  }
}

// Container for the users subMethods
// Required data: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users = {
  post: function(data, callback) {
      //Check that all required fileds are filled out
      const firstName = typeof data.payload.firstName == 'string' &&
      data.payload.firstName.trim().length > 0 ?
      data.payload.firstName.trim() : false;

      const lastName = typeof data.payload.lastName  == 'string' &&
      data.payload.lastName.trim().length > 0 ?
      data.payload.lastName.trim() : false;

      const phone = typeof data.payload.phone  == 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() : false;

      const password = typeof data.payload.password == 'string' &&
      data.payload.password.trim().length > 0 ?
      data.payload.password.trim() : false;

      const tosAgreement = typeof data.payload.tosAgreement === 'boolean' &&
      data.payload.tosAgreement;

      if(firstName && lastName && password && phone && tosAgreement) {
          // Make sure that the user doesn't exist
          _data.read('users', phone, function(err, data){
              if(!err){
                callback(400, {'Error': 'User is already exists'});
              } else {
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
                        } else {
                          callback(200);
                        }
                      }
                    );
                } else {
                  callback(500, {'Error': 'Could not hash user password'});
                }
              }
          });
      } else {
          callback('400', {'Error': 'Missing required fields'});
      }
  },
  // Required data: phone
  // optional data: none
  get: function(data, callback) {
      const phone = typeof data.query.phone == 'string' &&
      data.query.phone.trim().length === 10 ?
      data.query.phone.trim() : false

      if(phone) {
          // Get the token from the headers
          const token = typeof data.headers.token === 'string' ?
          data.headers.token : false;

          // Verify if a given token is valid for the phone number
          handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
              if(tokenIsValid) {
                  _data.read('users', phone, function(err, data){
                      if(!err && data){
                        delete data.hashedPassword;
                        callback(200, data);
                      } else {
                        callback(404);
                      }
                  });
              } else {
                callback(403, {"Error": "Missing required token in header or token is invalid"});
              }
          });
     } else {
       callback('400', {'Error': 'Missing required field'});
     }
  },
  // Required data: phone
  // optional data: firstName, lastName, password(at least one should be specified)
  put: function(data, callback) {
    const phone = typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false

    // Check optional fields
    const firstName = typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;

    const lastName = typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;

    const password = typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(!phone) {
      callback(400, {"Error": "Missing required field"});
      return
    }

    if(firstName || lastName || password) {
      // Get the token from the headers
      const token = typeof data.headers.token === 'string' ?
      data.headers.token : false;

      // Verify if a given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
          if(tokenIsValid) {
              // Lookup the user
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
                        } else {
                          callback(200);
                        }
                    });

                    callback(200, data);
                  } else {
                    callback(400, {"Error": "The specified user does not exists"});
                  }
              });
          } else {
              callback(403, {"Error": "Missing required token in header or token is invalid"});
          }
      });
    } else {
        callback(400, {"Error": ""});
    }
  },
  // Required data: phone
  delete: function(data, callback) {
      const phone = typeof data.query.phone == 'string' &&
      data.query.phone.trim().length == 10 ?
      data.query.phone.trim() : false

      if(phone) {
          // Get the token from the headers
          const token = typeof data.headers.token === 'string' ?
          data.headers.token : false;

          // Verify if a given token is valid for the phone number
          handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
              if(tokenIsValid) {
                _data.read('users', phone, function(err, userData){
                    if(!err && userData){
                      _data.delete('users', phone, function(err){
                        if(err){
                          callback(400, {"Error": "Could not delete specified user"});
                        } else {
                          //Delete each of the checks associated with the user
                          const userChecks = typeof userData.checks == 'object' &&
                          userData.checks instanceof Array ?
                          userData.checks : [];

                          if(userChecks.length) {
                              let checksDeleted = 0;
                              let deletionErrors = false;
                              console.log(userChecks);
                              userChecks.forEach(function(id){
                                console.log(id);
                                //Delete each check
                                _data.delete('checks', id, function(err){
                                    console.log('err', err);
                                    if(!err) {
                                        ++checksDeleted;
                                    } else {
                                        deletionErrors = true;
                                    }
                                });

                                if(deletionErrors) {
                                    callback({"Error": "Errors encountered while attemting to delete some check of specified user"});
                                } else {
                                    callback(200, {checksDeleted});
                                }
                              });
                          } else {
                              callback(200);
                          }
                        }
                      });
                    } else {
                      callback(400, {"Error": "Could not find specified user"});
                    }
                });
              } else {
                callback(403, {"Error": "Missing required token in header or token is invalid"});
              }
          });
     } else {
       callback(400, {'Error': 'Missing required field'});
     }
  }
}

// Container for all the tokens methods
// Required data: phone, password
// optional data: none
handlers._tokens = {
  post: function(data, callback) {
      //Check that all required fileds are filled out
      const phone = typeof data.payload.phone === 'string' &&
      data.payload.phone.trim().length === 10 ?
      data.payload.phone.trim() : false;

      const password = typeof data.payload.password == 'string' &&
      data.payload.password.trim().length > 0 ?
      data.payload.password.trim() : false;

      console.log(password, phone);
      if(password && phone) {
          // Lookup the user who matches that phone number
          _data.read('users', phone, function(err, data){
              if(err){
                callback(400, {'Error': 'Could not find the specified user'})
              } else {
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
                        } else {
                          callback(200, tokenObject);
                        }
                      }
                    );
                } else {
                  callback(400, {'Error': 'Password did not match the specified user stored password'});
                }
              }
          });
      } else {
          callback('400', {'Error': 'Missing required fields'});
      }
  },
  // Required data: id
  // optional data: none
  get: function(data, callback) {
    // Check that id is valid
      console.log("id::", data.query.id.trim().length);
      const id = typeof data.query.id === 'string' &&
      data.query.id.trim().length === 20 ?
      data.query.id.trim() : false

      if(id) {
        // Lookup the token
          _data.read('tokens', id, function(err, tokenData){
              if(!err && tokenData){
                callback(200, tokenData);
              } else {
                callback(404);
              }
        });
     } else {
       callback('400', {'Error': 'Missing required field'});
     }
  },
  // Required data: id, extend
  // optional data: none
  put: function(data, callback) {
    const id = typeof(data.payload.id) == 'string' &&
    data.payload.id.trim().length === 19 ?
    data.payload.id.trim() : false

    const extend = typeof(data.payload.extend) === 'boolean' &&
    data.payload.extend ? data.payload.extend : false;

    console.log(id, extend);

    if(id && extend) {
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
              if(tokenData.expiresIn > Date.now()) {
                tokenData.expiresIn = Date.now() + 1000 * 60 * 60;
                // Store the new updates
                _data.update('tokens', id, tokenData, function(err){
                  if(err){
                    console.log(err);
                    callback(500, {"Error": "Could not update the token expiration"});
                  } else {
                    callback(200, tokenData);
                  }
                });
              } else {
                  callback(400, {"Error": "The token has already expired and cannot be extended"});
              }
            } else {
                callback(400, {"Error": "The specified token does not exists"});
            }
      });
    } else {
      callback(400, {"Error": "Missing required field(s) or fields are invalid"});
    }
  },
  // Required data: id
  delete: function(data, callback) {
      const id = typeof(data.query.id) == 'string' &&
      data.query.id.trim().length === 19 ?
      data.query.id.trim() : false

      if(id) {
          _data.read('tokens', id, function(err, data){
              if(!err && data){
                _data.delete('tokens', id, function(err){
                  if(err){
                    callback(400, {"Error": "Could not delete specified token"});
                  } else {
                    callback(200);
                  }
                });
              } else {
                callback(400, {"Error": "Could not find specified token"});
              }
        });
     } else {
       callback('400', {'Error': 'Missing required field'});
     }
  },
  // Verify if a given token id is currently valid for a given user
  verifyToken: function(id, phone, callback) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData){
        if(!err && tokenData){
            if(tokenData.phone === phone && tokenData.expiresIn > Date.now()){
               callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
  }
}

// Container for all the checks methods
// Required data: url, protocol, method, successCodes, timeoutSeconds
// optional data: none
handlers._checks = {
  post: function(data, callback) {
      //Check that all required fileds are filled out
      const protocol = typeof data.payload.protocol == 'string' &&
      ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
      data.payload.protocol : false;

      const url = typeof data.payload.url == 'string' &&
      data.payload.url.trim().length > 0 ?
      data.payload.url.trim() : false;

      const method = typeof data.payload.method  == 'string' &&
      ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ?
      data.payload.method : false;

      const successCodes = typeof data.payload.successCodes == 'object' &&
      data.payload.successCodes instanceof Array &&
      data.payload.successCodes.length > 0 ?
      data.payload.successCodes : false;

      const timeoutSeconds = typeof data.payload.timeoutSeconds == 'number' &&
      data.payload.timeoutSeconds % 1 === 0 &&
      data.payload.timeoutSeconds > 0 &&
      data.payload.timeoutSeconds <= 5 ?
      data.payload.timeoutSeconds : false;

      if(protocol && url && method && successCodes && timeoutSeconds) {
          // Get the token from the headers
          const id = typeof data.headers.id === 'string' &&
          data.headers.id.trim().length === 20 ?
          data.headers.id.trim() : false;

          //Lookup the user by reading the token
          _data.read('tokens', id, function(err, tokenData){
              if(err){
                  callback(403, {'Error': 'Could not find the specified user'});
              } else {
                  console.log('tokenData', tokenData);
                  const userPhone = tokenData.phone;

                  //Lookup the users data
                  let userData = _data.read('users', userPhone, function(err, userData){
                      if(err){
                           callback(403);
                      } else {
                            console.log("userData: ", userData);
                            const userChecks = typeof userData.checks == 'object' &&
                            userData.checks instanceof Array ?
                            userData.checks : [];

                            //Verify that the user has less than the number max-checks-per-user
                            if(userChecks.length < config.maxChecks){
                                // Create the random ID for the check
                                const checkId = helpers.createRandomString(11);

                                // Create the check object and include the user phone
                                const checkObject = {
                                  'id': checkId,
                                  userPhone,
                                  protocol,
                                  method,
                                  url,
                                  successCodes,
                                  timeoutSeconds
                                };

                                // Save the object
                                _data.create('checks', checkId, checkObject, function(err){
                                    if(!err){
                                        console.log("userData: ", userData);
                                        // Add the checkId to the user object
                                        userData['checks'] = userChecks;
                                        userData.checks.push(checkId);

                                        // Save the new user data
                                        _data.update('users', userPhone, userData, function(err){
                                            if(!err){
                                                //Return the data about new check
                                                callback(200, checkObject);
                                            } else {
                                                callback(500, {'Error': 'Could not update user with the new check'});
                                            }
                                        });
                                    } else {
                                       callback(500, {'Error': 'Could not create the new check. '+ err});
                                    }
                                });
                            } else {
                                console.log('The user already has the max number of checks (' + config.maxChecks + ')');
                                callback(400, {'Error': 'The user already has the max number of checks (' + config.maxChecks + ')' });
                            }
                      }
                  });
              }
          });
      } else {
          callback('400', {'Error': 'Missing required inputs or inputs are invalid'});
      }
  },
  // Required data: id
  // optional data: none
  get: function(data, callback) {
      // Check that checkId is valid
      const id = typeof data.query.id  === 'string' &&
      data.query.id.trim().length === 11 ?
      data.query.id.trim() : false

      if(id) {
          // Lookup the check
          _data.read('checks', id, function(err, checkData){
              if(!err && checkData){
                  // Get the token from headers
                  const token = typeof(data.headers.token) === 'string' ?
                  data.headers.token : false;

                  // Verify that the given token is valid and belongs to the user who created the check
                  handlers._tokens.verifyToken(token, checkData.userPhone, function(isTokenValid){
                      if(isTokenValid) {
                          // Return the check data
                          callback(200, checkData);
                      } else {
                          callback(403, {"Error": "Token is not valid for specified user"});
                      }
                });
              } else {
                  callback(404, {"Error": "Check couldn't found"});
              }
          });
      } else {
          callback('400', {'Error': 'Invalid id was specified'});
      }
  },
  // Required data: id
  // optional data: protocol, url, method, successCodes, timeoutSeconds(at least one must be sent)
  put: function(data, callback){
      const id = typeof data.payload.id == 'string' &&
      data.payload.id.trim().length === 11 ?
      data.payload.id.trim() : false

      // Check optional fields
      const protocol = typeof data.payload.protocol === 'string' &&
      ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
      data.payload.protocol : false;

      const url = typeof data.payload.url === 'string' &&
      data.payload.url.trim().length > 0 ?
      data.payload.url.trim() : false;

      const method = typeof data.payload.method  === 'string' &&
      ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ?
      data.payload.method : false;

      const successCodes = typeof data.payload.successCodes === 'object' &&
      data.payload.successCodes instanceof Array &&
      data.payload.successCodes.length > 0 ?
      data.payload.successCodes : false;

      const timeoutSeconds = typeof data.payload.timeoutSeconds === 'number' &&
      data.payload.timeoutSeconds % 1 === 0 &&
      data.payload.timeoutSeconds > 0 &&
      data.payload.timeoutSeconds <= 5 ?
      data.payload.timeoutSeconds : false;

      if(id) {
          if(protocol || url || method || successCodes || timeoutSeconds){
            // Lookup the check
            _data.read('checks', id, function(err, checkData){
                if(!err && checkData){
                    // Get the token from headers
                    const token = typeof(data.headers.token) === 'string' ?
                    data.headers.token : false;

                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, function(isTokenValid){
                        if(isTokenValid) {
                            // Update check
                            if(protocol) checkData.protocol = protocol;
                            if(url) checkData.url = url;
                            if(method) checkData.method = method;
                            if(successCodes) checkData.successCodes = successCodes;
                            if(timeoutSeconds) checkData.timeoutSeconds = timeoutSeconds;

                            _data.update('checks', id, checkData, function(err){
                                if(err){
                                    callback(500, {"Error": "Could not update the check"});
                                } else {
                                    callback(200, checkData);
                                }
                            });
                        } else {
                            callback(403, {"Error": "Unathorised request or token is not valid"});
                        }
                  });
                } else {
                    callback(404, {"Error": "Check couldn't found"});
                }
            });
          } else {
             callback('400', {"Error": "At least one optional parameter should be specified"});
          }
      } else {
          callback('400', {"Error": "Invalid check id specified"});
      }
  },
  // Required data: id
  // optional data: none
  delete: function(data, callback){
      // Basically we need to delete check and after that delete it from the corresponding user
      const id = typeof data.query.id == 'string' &&
      data.query.id.trim().length === 11 ?
      data.query.id.trim() : false

      if(id) {
          // Lookup the check
          _data.read('checks', id, function(err, checkData){
              if(!err && checkData){
                  // Get the token from headers
                  const token = typeof(data.headers.token) === 'string' ?
                  data.headers.token : false;

                  // Verify that the given token is valid and belongs to the user who created the check
                  handlers._tokens.verifyToken(token, checkData.userPhone, function(isTokenValid){
                      if(isTokenValid) {
                          _data.delete('checks', id, function(err){
                              if(err){
                                  callback(500, {"Error": "Could not delete the check"});
                              } else {
                                  _data.read('users', checkData.userPhone, function(err, userData){
                                      if(!err && userData){
                                          const userChecks = typeof userData.checks == 'object' &&
                                          userData.checks instanceof Array ?
                                          userData.checks : [];

                                          const checkPosition = userChecks.indexOf(id);

                                          if(checkPosition > -1) {
                                              userChecks.splice(checkPosition, 1);
                                              // Re-save the user's data
                                              _data.update('users', checkData.userPhone, userData, function(err){
                                                  if(err){
                                                      console.log(err);
                                                      callback(500, {"Error": "Could not update the user"});
                                                  } else {
                                                      callback(200);
                                                  }
                                              });
                                          } else {
                                              callback(500, {"Error": "Could not find the check on the user object"});
                                          }
                                      } else {
                                          callback(500, {"Error": "Could not find the user who created the specified check"});
                                      }
                                  });
                              }
                          });
                      } else {
                          callback(403, {"Error": "Unathorised request or token is not valid"});
                      }
                  });
              } else {
                  callback(404, {"Error": "Check couldn't found"});
              }
          });
      } else {
          callback(400, {"Error": "Invalid check id specified"});
      }
  }
}


// Export the module
module.exports = handlers;
