// Generated by CoffeeScript 1.4.0
(function() {
  var plugin, _;

  plugin = require("plugin");

  _ = require("underscore");

  module.exports = function(params) {
    if (params == null) {
      params = {};
    }
    return plugin().params(params).require(__dirname + "/plugins").load().module("celeri");
  };

}).call(this);