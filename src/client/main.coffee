sift     = require "sift"
template = require "./template"

hotfix = window.hotfix = {}


MESSAGE_DISPLAY_TIME       = 1000 * 4

# sanity check IF phantom is not present
MIN_PAGE_REFRESH_INTERVAL = if typeof window.callPhantom != undefined then 0 else 1000 * 30

refreshTimeout = null

$(document).ready () ->

  PUBNUB.subscribe {

    channel  : "hotfix_refresh",

    connect  : () ->
      if hotfix.onConnect 
        hotfix.onConnect()

    callback : (payload) ->

      # used primarily for testing
      if hotfix.onHotFix
        hotfix.onHotFix payload


      # stop page refresh incase a hotfix is pushed a few times before the client is ready to refresh
      clearInterval refreshTimeout

      # randomize page reload time - we don't want all clients refreshing
      # at the same time - that would create a sort of DDOS attack ;)
      # TODO - use micro time for payload delivery to calculate interval AND use
      # num connections so we can carefuly tell how many users to refresh / second.
      # Note - MIN_PAGE_REFRESH_INTERVAL is a sanitiy check to make sure the payload interval isn't too small.
      refreshTimeout = setTimeout refreshPage, Math.random() * Math.max(MIN_PAGE_REFRESH_INTERVAL, payload.interval || 0), payload
      
  }



###
 refreshes the page
###

refreshPage = (payload) ->

  # used primarily for testing
  if hotfix.onDisplayMessage
    hotfix.onDisplayMessage payload

  # if a filter is provided, then check against the global variables
  # to see if the filter matches - e.g: classdojo.version = 19
  if payload.filter
    if sift(payload.filter, [window]).length is 0
      return 


  msg = showMessage payload


  reloadPage = () ->

    # used primarily for testing
    if hotfix.onReloadPage
      hotfix.onReloadPage payload

    location.reload()


  # only show a timeout if the error message is critical. Otherwise, make it a user interaction.
  if payload.critical
    setTimeout reloadPage, MESSAGE_DISPLAY_TIME
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






