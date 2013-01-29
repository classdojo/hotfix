fs = require "fs"
express = require "express"


module.exports = (httpServer) ->

	# place the public dependencies in a namespace so there are no file name 
	# collisions
	httpServer.use "/hotfix/", express.static(__dirname + "/public")



