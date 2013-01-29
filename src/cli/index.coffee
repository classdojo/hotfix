plugin = require "plugin"
_ = require "underscore"

module.exports = (params = {}) ->
	
	plugin().
	params(params).
	require(__dirname + "/plugins").
	load().
	module("celeri")
