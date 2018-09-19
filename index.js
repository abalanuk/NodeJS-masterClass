const http = require('http');

const server = http.createServer(function(req, res){
  res.end("TEST\n");
});

server.listen(3000, function(){
  console.log("Server is listening on port 3000")
});
