fs = require "fs"
pubnub = require "pubnub"
_ = require "underscore"


###
 This module is accessible throught the command line, and allows for changes
 to be sent to any connected client to the pubnub hotfix_refresh channel
###


exports.require = ["celeri"]
exports.plugin = (celeri) ->
	
	# command line options
	celeri.option {
		command: "push-changes",
		description: "Pushes changes to all clients that are currently viewing the site",
		optional: {
			"config": "Configuration file for pubnub.",
			"critical": "Critical update - user account is force refreshed.",
			"message": "Message to display to the client."
		},
		defaults: {
			"config": "/usr/local/etc/hotfix/config.json",
			"critical": false
			"message": "New updates are available for this page.",
			"messagePrefix": "This page needs to be refreshed"
		}
	}, publish




publish = (data) ->

	console.log "refreshing all connected clients"
	
	# load in the configuration file required for pubnub
	config = require data.config 

	# default data to send to the user can also be defined in the configuration file
	_.extend data, config.data

	pubNubClient = pubnub.init config.pubnub

	# push the changes onto the client
	# TODO - bleh - this needs to be in a separate module, and config
	# needs to be loaded there

	pubNubClient.publish {
		channel: "hotfix_refresh",
		message: {
			critical: data.critical,
			text: (if config.messagePrefix then "#{config.messagePrefix}: " else "") + data.message
		}
	}







