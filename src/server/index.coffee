fs      = require "fs"
express = require "express"
plugin  = require "plugin"
mkdirp  = require "mkdirp"

###
 Express plugin
###

module.exports = (httpServer, options = {}) ->
  

  if not options.route
    options.route = "/hotfix"

  # place the public dependencies in a namespace so there are no file name 
  # collisions
  httpServer.use options.route, express.static(__dirname + "/../client/")

  options.server    = httpServer
  options.configDir = "/usr/local/etc/hotfix"

  mkdirp options.configDir, () ->

    plugin().
    params(options).
    require(__dirname + "/plugins").
    load()





