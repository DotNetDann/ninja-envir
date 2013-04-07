var stream = require('stream')
  , util = require('util')
  , http = require("http")
  , fs = require("fs")
 
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
 
function Device(opts, currentCostComms) {
  var self = this;
  self._opts = opts;

  this.readable = true; // This device will emit data
  this.writeable = false; // This device can be actuated
 
  this.G = "0"; // G is a string a represents the channel
  this.V = 0;   // 0 is Ninja Blocks' vendor id
  this.D = 242; // 242 is a generic sensor energy kwh device id - http://ninjablocks.com/pages/device-ids
 
  process.nextTick(function() {
    log("Called process.nextTick");
    self.emit('data','');

    currentCostComms.on('data', function(data) {
      readData(self, data);
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


// --------------------------------------------------------------


function readData(self, serialInput) {
  // XML format -> http://www.currentcost.com/cc128/xml.htm
  log("Data: "+serialInput);

  var regTime = serialInput.match(new RegExp(/<time>(.*?)<\/time>/m));
  var regTemp = serialInput.match(new RegExp(/<tmpr> *([\-\d.]+)<\/tmpr>/m));

  if(regTemp == null) {
    log("Skipping History data");
    return;
  }

  var currWatt = 0;
  var wattRegex = new RegExp(/<ch\d><watts>0*(\d+)<\/watts><\/ch\d>(.*)/m);
  wattRegex.lastIndex = 0;
  var match;
  var wattInput = serialInput;
  while ( match = wattRegex.exec(wattInput) ) {
    currWatt += parseFloat(match[1]);
    wattInput = match[2];
  }

  var currTemp = parseFloat(regTemp[1]);

  log("Data Recieved From EnviR - Time:"+regTime[1]+" Temp:"+currTemp+" Watts:"+currWatt);

  self.D = 242;
  self.emit('data',currWatt);

  self.D = 202;
  self.emit('data',currTemp);
  
  //Should send data to CurrentCost
  if (self._opts.cosmSend == true) {
   sendToCurrentCost(self, currWatt, currTemp);
  }

}


var currentcostCountRecords = 0;
var currentcostTotalTemp = 0.0;
var currentcostTotalPower = 0.0;
function sendToCurrentCost(self, watt, temp) {

  currentcostCountRecords ++;
  currentcostTotalTemp += temp;
  currentcostTotalPower += watt;

  // Send every 5 mins. Updates come in every 6 seconds.
  if (currentcostCountRecords >= (60 * self._opts.cosmSendMins / 6)) {

    var post_data = (currentcostTotalTemp/currentcostCountRecords).toFixed(2)+","+parseInt(currentcostTotalPower/currentcostCountRecords);

    log("Send data to Cosm: "+post_data);

    var options = {
      host: 'pachube.com',
      port: 80,
      path: '/api/' + self._opts.cosmFeedId + '.csv',
      method: 'PUT',
      headers: {  
        'User-Agent': 'tinkerlondon.com CCBridge17',
        'Content-Type': 'text/csv',
        'Content-Length': post_data.length,
        'X-PachubeApiKey': self._opts.cosmApiKey
      }
    };


    // Set up the request
    var post_req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        log('Response: ' + chunk);
      });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

    currentcostCountRecords = 0;
    currentcostTotalTemp = 0.0;
    currentcostTotalPower = 0.0;
  }
}


function log(message) {
  //this._app.log.info(message);
  
  //var path = "/var/log/envir.log";
  //var now = new Date();
  //var dateAndTime = now.toUTCString();
  //
  //var log = fs.createWriteStream(path, {'flags': 'a'});
  //log.write(dateAndTime + " : " + message + "\n");
  //log.end();
}