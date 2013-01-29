domready = require "domready"
template = require "./template"
sift = require "sift"


# all clients MUST refresh the page within this given time interval
MAX_PAGE_REFRESH_INTERVAL = 1000
MESSAGE_RELOAD_TIME = 1000 * 5


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



###
 refreshes the page
###

refreshPage = (payload) ->

	
	# if a filter is provided, then check against the global variables
	# to see if the filter matches - e.g: classdojo.version = 19
	if payload.filter
		if sift(payload.filter, [window]).length is 0
			return 


	msg = showMessage payload


	reloadPage = () ->
		location.reload()


	# only show a timeout if the error message is critical. Otherwise, make it a user interaction.
	if payload.critical
		setTimeout reloadPage, MESSAGE_RELOAD_TIME
	else
		msg.find(".hotfix-refresh-button").click reloadPage
		msg.find(".hotfix-ignore-button").click () ->
			msg.animate { top: "-100px" }



###
###

showMessage = (data) ->

	msg = $(template)

	# place the message off-screen so we can add a nice animation
	msg.css({ top: "-100px" })
	msg.find(".hotfix-message").text data.text

	# if the message is critical, then do NOT give the option to close the message
	if data.critical
		msg.find(".hotfix-buttons").css { "display": "none" } 

	$(document.body).append msg

	# move the notification down so the user can see it
	msg.animate { top: "0px" }

	# return the message so we can listen when the ignore button is reset
	msg






