domready = require "domready"
template = require "./template"


# all clients MUST refresh the page within this given time interval
MAX_PAGE_REFRESH_INTERVAL = 1000


# on DOM ready, listen for hotfix_refresh
domready () ->

	PUBNUB.subscribe {
		channel: "hotfix_refresh",
		callback: (payload) ->

			# randomize page reload time - we don't want all clients refreshing
			# at the same time - that would create a sort of DDOS attack ;)
			# TODO - use micro time for payload delivery to calculate interval AND use
			# num connections so we can carefuly tell how many users to refresh / second.
			setTimeout refreshPage, Math.random() * MAX_PAGE_REFRESH_INTERVAL, payload
	}


	showMessage {
		text: "hello world!",
		critical: true
	}



###
 refreshes the page
###

refreshPage = (payload) ->
	console.log JSON.stringify payload


showMessage = (data) ->
	




