_      = require "underscore"
fs     = require "fs"
pubnub = require "pubnub"


###
 This module is accessible throught the command line, and allows for changes
 to be sent to any connected client to the pubnub hotfix_refresh channel
###


exports.require = ["celeri", "pubsub.pubnub"]

exports.plugin = (celeri, pubnubClient, loader) ->
  
  celeri.option {

    command     : "push OR push-changes",
    description : "Pushes changes to all clients that are currently viewing the site",

    optional    : {

      config   : "Configuration file for pubnub.",
      filter   : "mongodb-style filter for each client",
      message  : "Message to display to the client.",
      interval : "The interval in MS to randomize page refreshes",
      critical : "Critical update - user account is force refreshed."

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

    # push the changes onto the client
    pubnubClient.publish {

      channel : "hotfix_refresh",

      message : {

        text     : data.message,
        filter   : data.filter,
        critical : data.critical,
        interval : data.interval

      }
    }








