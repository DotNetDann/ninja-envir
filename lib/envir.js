var stream = require('stream')
  , util = require('util')
  , http = require('http')
  , fs = require('fs');
 
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

  this.readable = true;   // This device will emit data
  this.writeable = false; // This device can be actuated
 
  this.G = "0"; // G is a string a represents the channel
  this.V = 0;   // 0 is Ninja Blocks' vendor id
  this.D = 243; // 243 is a generic sensor energy kwh device id - http://ninjablocks.com/pages/device-ids
  
  currentCostComms.on('data', function(data) {
    readData(self, data);
  });

  process.nextTick(function() {
    log("Called process.nextTick");
    self.emit('data','');
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
  //log("Data: "+serialInput);

  var regTime = serialInput.match(new RegExp(/<time>(.*?)<\/time>/m));
  var regTemp = serialInput.match(new RegExp(/<tmpr> *([\-\d.]+)<\/tmpr>/m));
  var regSensor = serialInput.match(new RegExp(/<sensor>(.*?)<\/sensor>/m));

  if ((regTime == null) || (regTemp == null) || (regSensor == null)) {
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

  log("Data Recieved From EnviR - Time:"+regTime[1]+" Temp:"+currTemp+" Sensor:"+regSensor[1]+" Watts:"+currWatt);

  self.G = regSensor[1];
  self.D = 243;
  self.emit('data',currWatt);

  if (self._opts.cosmSend == true)
    sendToCurrentCost(self, parseInt(self.G)+1, currWatt);

  // Send temp if Chan 0 (Whole House)
  if (self.G == "0") {
    self.D = 202;
    self.emit('data',currTemp);
    
    if (self._opts.cosmSend == true)
      sendToCurrentCost(self, 0, currTemp);
  }
}


//                   temp,tempCnt,main,mainCnt,iam1,iam1Cnt, etc..
var currentcostArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
function sendToCurrentCost(self, chan, watt) {

  currentcostArr[(chan*2)] += watt;
  currentcostArr[(chan*2)+1] ++;

  //log(currentcostArr.toString());

  // Send every 5 mins. Updates come in every 6 seconds. (Check Temp Count)
  if (currentcostArr[1] >= (60 * self._opts.cosmSendMins / 6)) {

    var post_data = "";
    for (var i = 0; i < currentcostArr.length; i+=2) {
      if (currentcostArr[i+1] > 0)
        post_data += (currentcostArr[i]/currentcostArr[i+1]).toFixed(1);
      post_data += ",";
    }

    for (var i = post_data.length; i > 0; i--) {
      if (post_data.substring(i-1, i) == ",")
        post_data = post_data.substring(0, i-1);
      else
        i = 0;
    }

    // Reset to 0
    for (var i = 0; i < currentcostArr.length; i++)
      currentcostArr[i] = 0;

    log("Send data to Cosm: "+post_data);

    var options = {
      host: 'pachube.com',
      port: 80,
      path: '/api/' + self._opts.cosmFeedId + '.csv',
      method: 'PUT',
      headers: {  
        //'User-Agent': 'tinkerlondon.com CCBridge17',
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