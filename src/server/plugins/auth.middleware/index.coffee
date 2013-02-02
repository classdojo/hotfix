vine = require "vine"
comerr = require "comerr"

exports.plugin = (loader) ->

  key = loader.params "key"

  return (req, res, next) ->
  
    return next() if not key

    if req.query.key is not key
      return res.send vine.error new comerr.Unauthorized("Invalid hotfixkey")

    next()

