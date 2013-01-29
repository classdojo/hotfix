// Generated by CoffeeScript 1.4.0
(function() {
  var express, hotfix, runServer;

  express = require("express");

  hotfix = require("../../../");

  exports.require = ["celeri"];

  exports.plugin = function(celeri) {
    return celeri.option({
      command: "run-server",
      description: "Runs the hotfix http server",
      optional: {
        "port": "The http port to run hotfix on"
      },
      defaults: {
        "port": 8080
      }
    }, runServer);
  };

  runServer = function(data) {
    var server;
    server = express();
    hotfix.server(server);
    return server.listen(data.port);
  };

}).call(this);