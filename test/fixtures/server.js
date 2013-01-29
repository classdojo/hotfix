var hotfix = require("../../"),
express    = require("express");


exports.init = function(port) {
  var server = express();
  server.use(express.static(__dirname + "/public"));
  hotfix.server(server);
  server.listen(port);
}