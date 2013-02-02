mkdirp = require "mkdirp"
express = require "express"
fs = require "fs"
vine = require "vine"
outcome = require "outcome"

exports.require = ["auth.middleware"]

exports.plugin = (authMiddleware, loader) ->

  server    = loader.params "server"
  configDir = loader.params "configDir"
  route     = loader.params "route"

  # info about the current version of hotfix
  infoPath  = "#{configDir}/info.json"

  ###
  ###

  server.get "#{route}/info.json", (req, res) ->

    o = outcome.e (err) ->
      res.send vine.error err

    fs.readFile infoPath, "utf8", o.s (content) ->
      json = JSON.parse content
      res.jsonp vine.result json

  ###
  ###

  server.post "#{route}/info.json", express.bodyParser(), authMiddleware, (req, res) ->

    info = req.body

    # add the timestamp - this is the check against the 
    info.updatedAt = Date.now()

    o = outcome.e (err) ->
      res.send vine.error err

    fs.writeFile infoPath, JSON.stringify(info, null, 2), o.s () ->
      res.send vine.result info



