var structr = require("structr"),
step = require("step"),
phantom = require("node-phantom"),
async = require("async"),
outcome = require("outcome"),
Client = require("./client");

module.exports = structr({

  /**
   */

  "__construct": function(count) {
    this.count = count;
  },

  /**
   */

  "load": function(open, next) {
    var on = outcome.e(next), self = this;
    step(
      function() {
        phantom.create(this);
      },
      on.s(function(ph) {
        self.phantom = ph;

        //need to provide an array filled with values - new Array(NUM_CLIENTS) doesn't work for async.map
        // - also we use an array since async.map is an elegant method of asynchrously creating phantomjs clients
        for(var i = self.count, stack = []; i--;) stack.push(i);

        async.map(stack, function(n, next) {
          new Client(open, ph).load(next);
        }, this);
      }),
      next
    );
  },


  /**
   */

  "kill": function() {
    this.phantom.exit();
  }
});