pubnub = require "pubnub"

###
  Initializes the pubnub client
###

exports.plugin = (loader) ->
  pubnub.init loader.params "pubnub"  