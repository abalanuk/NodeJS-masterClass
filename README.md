# NodeJS-masterClass
Node.js Master Class
https://pirple.thinkific.com/courses/take/the-nodejs-master-class

# Common idea is creating http/https server which listens on configured port and by callback is processing data by req/resp objects
# By "path" got from "req" object we are making decision whether we have handler mapped to route in router
# If handler exists, we are calling it with data formed from "req" object and providing callback function declaration according to business logic which accepts 
# data and optional payload. Then we are calling method tied to parent path's handler and specified method in "data" to do some business logic(write/update some data into file)

# First App: an "uptime monitor" allows users to enter URLs they want monitored, and receive alerts when those resources "go down" or "come back up"
1. API allows create/edit/delete user
2. User can "sign in" and get the token for future authenticated requests
4. User can "sign out" which invalidates their token
5. Signed-in user using token can create a "check": task to check a given URL if it is up or down.
6. Signed-in user using token can edit/delete their checks but only limited number.
7. Each "check" should be performed in the background(at the appropriate time) and alerts to the user when a check changes its state from "up" to "down"

#### Features: 
- user sign-up/sign in
- user sign out
- create/edit/delete user
- create/edit/delete check for a given URL
- send SMS alert to user


# Running App:
NODE_ENV=staging node index.js or simply node index.js

@TODO: 
- add jshint|jslint
- create a real schema/tables in DB and connect API to get/put data into it 

### Test data:
{
    "firstName": "Andrew",
     "lastName":"Balanuk",
     "phone":"1234567899",
     "password": "ThisIsPassword",
     "tosAgreement": true
}

### Concepts

Error back:
exampleFunction(function(err, data)) {
    // check the error
    // do stuff with the data
}