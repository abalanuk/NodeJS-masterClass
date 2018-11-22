/*
* Lib for storing and editing data
*/

// Deps
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

let lib = {
  baseDir: path.join(__dirname, '/../.data/'),
  create: function(dir, fileName, data, callback) {
    fs.open(lib.baseDir+dir+'/'+fileName+'.json', 'wx', function(err, fileDescriptor){
      if(!err && fileDescriptor){
          const stringData = JSON.stringify(data);

          fs.writeFile(fileDescriptor, stringData, function(err){
            if(!err){
                fs.close(fileDescriptor, function(){
                    if(!err){
                        callback(false);
                    } else {
                        callback('Error closing new file');
                    }
                })
            } else {
                callback('Error writing to new file');
            }
          })
      } else {
          callback('Could not create new file, it may already exist');
      }
    });
  },
  read: function(dir, fileName, callback){
    fs.readFile(lib.baseDir+dir+'/'+fileName+'.json', 'utf8', function(err, data){
        if(!err && data) {
            callback(false, helpers.parseJsonToObject(data));
        } else {
            callback(err, data);
        }
    })
  },
  update: function(dir, fileName, data, callback){
    fs.open(lib.baseDir+dir+'/'+fileName+'.json', 'r+', function(err, fileDescriptor){
      if(!err && fileDescriptor){
          const stringData = JSON.stringify(data);

          fs.truncate(fileDescriptor, function(err){
              if(!err){
                  fs.writeFile(fileDescriptor, stringData, function(err){
                      if(!err){
                          fs.close(fileDescriptor, function(){
                              if(!err){
                                  callback(false);
                              } else {
                                  callback('Error closing new file');
                              }
                          })
                      } else {
                          callback('Error writing to new file');
                      }
                  })
              } else {
                  callback('Error truncating file');
              }
          });
      } else {
          callback('Could not open a file for updating...it may not created yet');
      }
    })
  },
  delete: function(dir, fileName, callback){
    // Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+fileName+'.json', function(err){
        if(!err){
            callback(false);
        } else {
            callback('Error deleting file...');
        }
    });
  }
}

module.exports = lib;
