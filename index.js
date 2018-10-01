const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const server = http.createServer(function(req, res){
  // Get the URL and parse it

  // Get the path from URL
  const parsedUrl = url.parse(req.url, true);

  const {pathname} = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/+$/g,'');

  // Get the HTTP method
  const {method} = req;

  // Get the query string as an object
  const {query} = parsedUrl;

  // Get the headers as an object
  const {headers} = req;

  // Get the payload if any
  const decoder = new stringDecoder('utf-8');
  let buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  })

  req.on('end', function(){
    buffer += decoder.end();

    //Choose the handler this request should go to
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
    router[trimmedPath] : handlers.notFound;

    // Construct data object to send to the handler
    data = {
      'trimmedPath': trimmedPath,
      'query': query,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    chosenHandler(data, function(statusCode, payload){
        // Use the status code or the default 200
        statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
        // Use the payload or the default {}
        payload = typeof(payload) === 'object' ? payload : {};

        const payloadString = JSON.stringify(payload);

        // Send the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        console.log("Returned response: \n", statusCode, payloadString);
    })
  })

  // Log the path user requested
  console.log("Requested path: " + trimmedPath);
  /*
  console.log("With method: " + method);
  console.log("Query object is: \n" + JSON.stringify(query));
  console.log("Request headers: \n" + JSON.stringify(headers));
  */
});

server.listen(config.port, function(){
  console.log("Server is listening on port " + config.port + " in "+ config.envName);
});

//Define the handlers
handlers = {
  test: function(data, callback){
    // callback a http status code and a payload object
    callback(406, data);
  },
  notFound: function(data, callback){
    callback(404);
  }
}

// Define a request router
router = {
  'test': handlers.test
}
