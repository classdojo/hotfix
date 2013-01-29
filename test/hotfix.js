var phantom = require("node-phantom"),
expect      = require("expect.js"),
outcome     = require("outcome"),
async       = require("async"),
step        = require("step"),
EventEmitter = require("events").EventEmitter,
HotfixClient = require("./fixtures/client"),
hotfixServer = require("./fixtures/server"),
hurryUp      = require("hurryup"),
hotfix       = require("../");


var on = outcome.e(function(err) {
  console.error(err);
}),
NUM_CLIENTS = 20,
SERVER_PORT = 8081,
INTERVAL    = 1000 * 5;

step(

  /**
   * first, we need to initialize the hotfix test server
   */


  function() {
    hotfixServer.init(SERVER_PORT);
    this();
  },

  /** 
   * open up all the clients
   */


  on.s(function() {

    console.log("building %d phantom clients", NUM_CLIENTS);

    //need to provide an array filled with values - new Array(NUM_CLIENTS) doesn't work for async.map
    // - also we use an array since async.map is an elegant method of asynchrously creating phantomjs clients
    for(var i = NUM_CLIENTS, stack = []; i--;) stack.push(i);


    async.map(stack, function(n, next) {
      new HotfixClient({ open : "http://localhost:" + SERVER_PORT }).load(next);
    }, this);
  }),

  /**
   */

  on.s(function(clients) {

    console.log("pushing hotfix changes with max interval of %d", INTERVAL);


    //these credentials were created using a test account for pubnub + 10minutemail
    hotfix.cli({
      pubnub: {
        publish_key: "pub-c-97969bcd-8738-401e-b311-7ddfe8b6bdfa",
        subscribe_key: "sub-c-370fa04a-6a62-11e2-a9fa-12313f022c90"
      }
    }).emit("push-changes", { interval: INTERVAL, critical: true });

    //start the tests
    this(null, clients);
  }),

  /**
   */

  on.s(function(clients) {
    async.map(clients, testClient, this);
  }),


  /**
   */

  on.s(function() {
    console.log("all clients reloaded successfuly");
  })

);



function testClient(client, next) {

  var on = outcome.e(function(err) {
    console.log("ERR")
    next(err);
  });

  step(

    /**
     * wait for the hotfix message
     */

    function() {
      hurryUp(client.once, 2000).call(client, "hotFix", this);
    },

    /**
     * wait for the message to be displayed - this will be a critical message
     */

    on.s(function() {
      //timeout with some padding to display the message
      hurryUp(client.once, INTERVAL + 1000 * 2).call(client, "displayMessage", this);
    }),

    /**
     * wait for the page to reload
     */

    on.s(function(payload) {
      hurryUp(client.once, 10000).call(client, "reloadPage", this);
    }),


    /**
     * finally wait for reconnect
     */

    on.s(function() {
      hurryUp(client.once, 1000 * 3).call(client, "connect", this);
    }),


    /**
     */

    on.s(function() {
      console.log("SUCCESS!")
      next()
    })

  );
}
