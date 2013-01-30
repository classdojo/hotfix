var phantom = require("node-phantom"),
outcome     = require("outcome"),
step        = require("step"),
EventEmitter = require("events").EventEmitter,
structr      = require("structr"),
hurryUp      = require("hurryUp");


module.exports = structr(EventEmitter, {

  /**
   */

  "__construct": function(open, ph) {
    this.open = open;
    this.phantom = ph;
  },

  /** 
   */

  "load": function(callback) {
    var on = outcome.e(callback),
    self   = this;

    step(
      on.s(function(ph) {
        self.phantom.createPage(this);
      }),
      on.s(function(page) {
        self.page = page;
        page.open(self.open, this);
      }),
      on.s(function(status) {
        if(status != "success") return this(new Error("status returned is " + status));
        self._listenForEvents();

        //wait for connect, but timeout after 5 seconds
        hurryUp(self.once).call(self, "connect", this);
        
      }),
      on.s(function() {
        callback(null, self);
      })
    );

    return this;
  },

  /**
   */

  "_listenForEvents": function() {

    var page = this.page, 
    self = this;

    page.onCallback = function(data) {
      self.emit(data.command, null, data.payload);
    }
  },

  "kill": function() {
    self.phantom.exit();
  }
});