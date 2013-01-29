_      = require "underscore"
fs     = require "fs"
pubnub = require "pubnub"


###
 This module is accessible throught the command line, and allows for changes
 to be sent to any connected client to the pubnub hotfix_refresh channel
###


exports.require = ["celeri", "pubsub.pubnub"]

exports.plugin = (celeri, pubnubClient, loader) ->
	
	# command line options
	celeri.option {
		command: "push-changes",
		description: "Pushes changes to all clients that are currently viewing the site",
		optional: {
			"config": "Configuration file for pubnub.",
			"critical": "Critical update - user account is force refreshed.",
			"message": "Message to display to the client.",
			"filter": "mongodb-style filter for each client"
		},
		defaults: {
			"critical": loader.params("data.critical") or false,
			"message": loader.params("data.message") or "New updates are available for this page."
		}
	}, (data) ->

		# filter against the client - this maybe important incase a user is running a different version of the app ~
		# perhaps because of a different type of browser
		data.filter = JSON.parse(data.filter) if data.filter
		
		console.log "refreshing all connected clients"

		# push the changes onto the client
		# TODO - bleh - this needs to be in a separate module, and config
		# needs to be loaded there

		pubnubClient.publish {
			channel: "hotfix_refresh",
			message: {
				critical: data.critical,
				text: data.message,
				filter: data.filter
			}
		}








