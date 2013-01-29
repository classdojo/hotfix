var express = require("express"),
server = express();

server.use(express.static(__dirname + "/public"));
require("../../").server(server);
server.listen(8080);
console.log("started HTTP server on port 8080");