express = require "express"
hotfix  = require "../../../"

exports.require = ["celeri"]
exports.plugin = (celeri) ->
	
	# command line options
	celeri.option {
		command: "run-server",
		description: "Runs the hotfix http server",
		optional: {
			"port": "The http port to run hotfix on"
		},
		defaults: {
			"port": 8080
		}
	}, runServer


runServer = (data) ->
	server = express()
	hotfix.server server
	server.listen data.port