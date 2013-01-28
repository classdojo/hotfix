var express = require("express"),
server = express();

server.use(express.static(__dirname + "/public"));
server.use(require("../../"));
server.listen(8080);
console.log("started HTTP server on port 8080");