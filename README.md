# NodeJS-masterClass
Node.js Master Class
https://pirple.thinkific.com/courses/take/the-nodejs-master-class

1. An "uptime monitor" allows users to enter URLs they want monitored, and receive alerts when those resources "go down" or "come back up"
2. API allows create/edit/delete user
3. User can "sign in" and get the token for future authenticated requests
4. Allows user to "sign out" which invalidates their token
5. Signed-in user using token can create a "check": task to check a given URL if it is up or down.
6. Signed-in user using token can edit/delete their checks but only limited number.
7. Each "check" should performed in the background(at the appropriate time) and alerts to the user when a check changes its state from "up" to "down"
8.  
#### Features: 
- user sign-up/sign in 
- send SMS alert to user


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

Errback:
exampleFunction(function(err, data)) {
    // check the error
    // do stuff with the data
}