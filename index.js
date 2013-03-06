var Device = require('./lib/envir')
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
function envir(opts,app) {

  /**
  * Check that the serial port is correct 
  * $ dmesg | grep tty
  */
  var serialPortName = "ttyUSB0";


// TODO: Check Serial ports. If none then exit.



  var self = this;

  app.on('client::up',function(){
    // The client is now connected to the cloud

    // Do stuff with opts, and then commit it to disk
    if (!opts.hasMutated) {
      opts.hasMutated = true;
    }

    self.save();

    // Register a device
    console.log("Envir: Register");
    self.emit('register', new Device(serialPortName));
  });
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
envir.prototype.config = function(config) {

};

// Export it
module.exports = envir;