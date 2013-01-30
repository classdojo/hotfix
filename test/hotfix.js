var phantom = require("node-phantom"),
expect      = require("expect.js"),
outcome     = require("outcome"),
async       = require("async"),
step        = require("step"),
EventEmitter = require("events").EventEmitter,
HotfixPh     = require("./fixtures/phantom"),
hotfixServer = require("./fixtures/server"),
hurryUp      = require("hurryup"),
hotfix       = require("../");


var on = outcome.e(function(err) {
  console.error(err);
}),
NUM_CLIENTS = 5,
SERVER_PORT = 8081,
INTERVAL    = 1000 * 5;


describe("Hotfix", function() {

    var clients, phantom, o = outcome;

    it("Should connect to the server successfuly", function() {
      hotfixServer.init(SERVER_PORT);
    });


    it("Should create a lot of phantom clients", function(done) {
      phantom = new HotfixPh(NUM_CLIENTS);
      phantom.load("http://localhost:" + SERVER_PORT, o.e(done).s(function(c) {
        clients = c;
        done();
      }));
    });


    it("Should push lots of hotfixes", function() {

      //these credentials were created using a test account for pubnub + 10minutemail
      hotfix.cli({
        pubnub: {
          publish_key: "pub-c-97969bcd-8738-401e-b311-7ddfe8b6bdfa",
          subscribe_key: "sub-c-370fa04a-6a62-11e2-a9fa-12313f022c90"
        }
      }).emit("push-changes", { interval: INTERVAL, critical: true });


    });


    it("Should have many updated clients", function(done) {
      async.map(clients, testClient, done);
    });


    it("Should kill phantom", function() {
      phantom.kill();
    });
});



function testClient(client, next) {


  var on = outcome.e(function(err) {
    next(err);
  });


  step(

    /**
     * wait for the hotfix message
     */

    function() {
      hurryUp(client.once).call(client, "hotFix", this);
    },

    /**
     * wait for the message to be displayed - this will be a critical message
     */

    on.s(function() {
      //timeout with some padding to display the message
      hurryUp(client.once).call(client, "displayMessage", this);
    }),

    /**
     * wait for the page to reload
     */

    on.s(function(payload) {
      hurryUp(client.once).call(client, "reloadPage", this);
    }),


    /**
     * finally wait for reconnect
     */

    on.s(function() {
      hurryUp(client.once).call(client, "connect", this);
    }),


    /**
     */

    on.s(function() {
      next()
    })
  );

}
