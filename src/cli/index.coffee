_      = require "underscore"
plugin = require "plugin"

###
 Main application entry point. This module loads everything required for the CLI
###

module.exports = (params = {}) ->
  
  plugin().
  params(params).
  require(__dirname + "/plugins").
  load().
  module("celeri")
