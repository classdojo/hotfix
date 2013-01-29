hotfix  = require "../../../"
express = require "express"


###
 Runs a stand-alone http server
###

exports.require = ["celeri"]

exports.plugin = (celeri, loader) ->
  
  celeri.option {

    command     : "server",
    description : "Runs the hotfix http server",

    optional    : {
      port : "The http port to run hotfix on"
    },

    defaults : {
      port : loader.params("data.port") or 8080
    }

  }, runServer


###
###

runServer = (data) ->
  server = express()
  hotfix.server server
  server.listen data.port