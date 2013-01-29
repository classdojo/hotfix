pubnub = require "pubnub"

###
  Initializes the pubnub client
###

exports.plugin = (loader) ->	
	return pubnub.init loader.params "pubnub"	