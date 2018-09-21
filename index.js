const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;

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

    // Send the response
    res.end("TEST\n");

    console.log("Request payload: \n" + buffer);
  })

  // Log the path user requested
  console.log("Requested path: " + trimmedPath);
  console.log("With method: " + method);
  //console.log("Query object is: \n" + JSON.stringify(query));
  //console.log("Request headers: \n" + JSON.stringify(headers));
});

server.listen(3000, function(){
  console.log("Server is listening on port 3000")
});
