var EnviR = require('./lib/envir')
  , Comms = require('./lib/comms')
  , configHandlers = require('./lib/config')
  , util = require('util')
  , stream = require('stream');

// Give our module a stream interface
util.inherits(envir,stream);

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default module configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the cloud
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the cloud
 */
 

/**
 * Serial port name 'ttyUSB0' is for the USB cable - http://www.currentcost.com/product-datacable.html
 * Serial port name 'ttyO5' is on-board Serial 5
 * 		NOTE: You need to put these lines in /etc/rc.local
 * 			echo 4 > /sys/kernel/debug/omap_mux/lcd_data8
 * 			echo 24 > /sys/kernel/debug/omap_mux/lcd_data9
 *
 * 		CC128		Beagle Bone			Cat5 Wire Colour 	Notes
 * 		---------------------------------------------------------------------------------
 * 		Pin 1		Pin P9-01 or 02  	Blue				Gnd
 * 		Pin 4		Pin P9-03 or 04 	Green Stripe		3.3v
 * 		Pin 7		Pin P8-37			Brown Stripe		Serial Data (Optional)
 * 		Pin 8		Pin P8-38			Brown				Serial Data
 */

 
function envir(opts,app) {
  this._app = app;
  this._opts = opts;
  var self = this;

  var envirDriver = null;

  if (self._opts.serialPortName == null) {
    // Set the default varables
    self._opts.serialPortName = "ttyUSB0";
    self._opts.cosmSend = false;
    self._opts.cosmSendMins = 5; // Send every 5 mins. Updates come in every 6 seconds.
    self._opts.cosmFeedId = "";  
    self._opts.cosmApiKey = "";  
    self.save();
  }
  

  app.on('client::up',function(){
    // The client is now connected to the cloud

    if (envirDriver == null) {
      var currentCostComms = new Comms(app, "/dev/" + self._opts.serialPortName);
      envirDriver = new EnviR(self._opts, currentCostComms);
    }

    // Do stuff with opts, and then commit it to disk
    if (!opts.hasMutated) {
      opts.hasMutated = true;
    }

    self.save();

    // Register a device
    console.log("Envir: Register");
    self.emit('register', envirDriver);
  });
};


/**
 * Called when a user prompts a configuration
 * @param  {Object}   rpc     Used to match up requests.
 * @param  {Function} cb      Callback with return data
 */
envir.prototype.config = function(rpc,cb) {

  var self = this;

  if (!rpc) {
    return configHandlers.probe.call(this,cb);
  }

  switch (rpc.method) {
    case 'manual_set':     return configHandlers.manual_set.call(this,rpc.params,cb);     break;

    default:               return cb(true);                                               break;
  }
};


// Export it
module.exports = envir;