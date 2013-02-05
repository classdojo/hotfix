sift     = require "sift"
template = require "./template"

hotfix = window.hotfix = {}


MESSAGE_DISPLAY_TIME       = 1000 * 3

# sanity check IF phantom is not present
MIN_PAGE_REFRESH_INTERVAL = if (typeof window.callPhantom isnt "undefined" or window.debugHotfix) then 1000 else 1000 * 30

refreshTimeout = null
lastUpdated = Date.now()


$(document).ready () ->

  $hfx = $ "#hotfix"


  host = $hfx.attr("data-host") or $hfx.attr("host") or ""



  setInterval checkForUpdates, MIN_PAGE_REFRESH_INTERVAL, host
  checkForUpdates host
  
 



checkForUpdates = (host) ->

  $.getJSON("#{host}/hotfix/info.json?callback=?").success (resp) ->

    result = resp.result

    
    if result.updatedAt > lastUpdated
      lastUpdated = result.updatedAt
      refreshPage result




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
  msg.find(".hotfix-message").text data.message

  # if the message is critical, then do NOT give the option to close the message
  if data.critical
    msg.find(".hotfix-buttons").css { "display": "none" } 

  $(document.body).append msg

  # move the notification down so the user can see it
  msg.animate { top: "0px" }

  # return the message so we can listen when the ignore button is reset
  msg






