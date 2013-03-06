var stream = require('stream')
  , util = require('util')
  , serialPort = require("/opt/ninja/node_modules/serialport").SerialPort;
 
// Give our module a stream interface
util.inherits(Device,stream);
 
// Export it
module.exports=Device;
 
/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Function} write Called when data is received from the cloud
 *
 * @fires data - Emit this when you wish to send data to the cloud
 */
 
function Device(serialPortName) {
 
  var self = this;
 
  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = false;
 
  this.G = "0"; // G is a string a represents the channel
  this.V = 0;   // 0 is Ninja Blocks' vendor id
  this.D = 242; // 242 is a generic sensor energy kwh device id - http://ninjablocks.com/pages/device-ids
 
  process.nextTick(function() {
    console.log("Called process.nextTick");
    
    self.emit('data','');
	  
    var serial = new serialPort("/dev/"+serialPortName, { baudrate : 57600} );

    var serialData = "";
    serial.on("open", function () {
      console.log("Serial port open");

      serial.on("data", function(data) {
        serialData += data;

        // Check if the last char was a carriage return
        if (serialData.charCodeAt(serialData.length-2) == 13 ) {
          readData(self, serialData);
          serialData = "";
        }
      });
    });
  });
};
 
/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {
 
};


function readData(self, serialInput) {
  // XML format -> http://www.currentcost.com/cc128/xml.htm
  //console.log("readData: "+serialInput);

  var regTime = serialInput.match(new RegExp(/<time>(.*?)<\/time>/m));
  var regTemp = serialInput.match(new RegExp(/<tmpr> *([\-\d.]+)<\/tmpr>/m));

  if(regTemp == null) {
    console.log("Skip History data");
    return;
  }

  var regWatt = 0;
  var wattRegex = new RegExp(/<ch\d><watts>0*(\d+)<\/watts><\/ch\d>(.*)/m);
  wattRegex.lastIndex = 0;
  var match;
  var wattInput = serialInput;
  while ( match = wattRegex.exec(wattInput) ) {
    //console.log("chan:"+match[1]);
    regWatt += parseInt(match[1]);
    wattInput = match[2];
  }

  console.log("Data Recieved From EnviR - Time:"+regTime[1]+" Temp:"+regTemp[1]+" Watts:"+regWatt);

  self.D = 242;
  self.emit('data',regWatt);

  self.D = 202;
  self.emit('data',parseFloat(regTemp[1]));
}