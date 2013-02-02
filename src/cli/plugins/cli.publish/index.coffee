_      = require "underscore"
fs     = require "fs"
request = require "request"


###
 This module is accessible throught the command line, and allows for changes
 to be sent to any connected client to the pubnub hotfix_refresh channel
###


exports.require = ["celeri"]

exports.plugin = (celeri, loader) ->
  
  celeri.option {

    command     : "push OR push-changes",
    description : "Pushes changes to all clients that are currently viewing the site",

    optional    : {

      config   : "Configuration file for pubnub.",
      filter   : "mongodb-style filter for each client",
      message  : "Message to display to the client.",
      interval : "The interval in MS to randomize page refreshes",
      critical : "Critical update - user account is force refreshed.",
      gateway  : "The hotfix gateway"
      key      : "The hotfix host key"

    },

    # fetch the defaults from the passed config, or used hard-coded values
    defaults : _.extend {

      message  : "New updates are available for this page.",
      interval : 1000 * 60,
      critical : false

    }, loader.params("data")

  }, (data) ->

    # filter against the client - this maybe important incase a user is running a different version of the app ~
    # perhaps because of a different type of browser
    data.filter = JSON.parse(data.filter) if data.filter
    
    console.log "refreshing all connected clients"

    request.post {
      url: "#{data.gateway}/info.json?key=" + data.key,
      json: {
        message: data.message,
        interval: data.interval,
        critical: data.critical,
        filter: data.filter
      }
    }, (e, r, b) ->
      console.log b







