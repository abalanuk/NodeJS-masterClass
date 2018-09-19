const http = require('http');
const url = require('url');

const server = http.createServer(function(req, res){
  // Get the URL and parse it

  // Get the path from URL
  const parsedUrl = url.parse(req.url, true);

  const {pathname} = parsedUrl
  const trimmedPath = pathname.replace(/^\/+|\/+$/g,'')

  // Get the HTTP method
  const {method} = req

  // Get the query string as an object
  const {query} = parsedUrl

  // Send the response
  res.end("TEST\n");

  // Log the path user requested
  console.log("Requested path: " + trimmedPath);
  console.log("With method: " + method);
  console.log("Query object is: " + query);
});

server.listen(3000, function(){
  console.log("Server is listening on port 3000")
});
