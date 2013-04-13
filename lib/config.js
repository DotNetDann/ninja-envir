var exec = require('child_process').exec;

exports.probe = function(cb) {

  var toShow = {
    "contents":[
      { "type":"paragraph",  "text":"Choose the serial port that will be used to get data from the Current Cost EnviR device."},
      { "type": "input_field_select", "field_name": "serialPortName", "label": "Choose Serial Port", "options": [{ "name": "", "value": "", "selected": true}], "required": true },
      //{ "type":"input_field_text", "field_name": "serialPortName", "value": this._opts.serialPortName, "label": "Serial Port Name", "placeholder": "ttyO5", "required": true},
      { "type":"paragraph",  "text":"Here you can specify if you would like your data sent to Cosm.com"},
      { "type":"input_field_text", "field_name": "cosmSend", "value": this._opts.cosmSend, "label": "Cosm - Send Data?", "placeholder": "false", "required": true},
      { "type":"input_field_text", "field_name": "cosmSendMins", "value": this._opts.cosmSendMins, "label": "Cosm - Send Mins", "placeholder": "5", "required": false},
      { "type":"input_field_text", "field_name": "cosmFeedId", "value": this._opts.cosmFeedId, "label": "Cosm - Feed Id", "placeholder": "12345", "required": false},
      { "type":"input_field_text", "field_name": "cosmApiKey", "value": this._opts.cosmApiKey, "label": "Cosm - API Key", "placeholder": "askjdhakshdaisdiashdkjashdkjasd", "required": false},
      { "type": "submit", "name": "Save", "rpc_method": "manual_set" }
    ]
  };

  var serialPortNameSetting = this._opts.serialPortName;


  exec('dmesg | grep tty', function (error, stdout, stderr) {
    var foundMatch = stdout.match(new RegExp(/tty[a-zA-Z0-9]+/mg));
    var foundSerials = [];

    for (var i=0;i<foundMatch.length;i++)
      if (foundSerials.indexOf(foundMatch[i]) == -1)
        foundSerials.push(foundMatch[i]);

    // Add whatever was set in the settings just in case
    if (foundSerials.indexOf(serialPortNameSetting) == -1)
      foundSerials.push(serialPortNameSetting);


    if (foundSerials.length>0) {
      var optionArr = [];
      for (var i=0;i<foundSerials.length;i++)
        optionArr.push({name:foundSerials[i], value:foundSerials[i], selected:(serialPortNameSetting==foundSerials[i])});
      toShow.contents[1].options = optionArr;
    }

    
    cb(null,toShow);
  });
};

exports.manual_set = function(params,cb) {

  if (params.serialPortName.length == 0) {
    cb(null, { "contents":[ { "type": "paragraph", "text": "Serial Port Name must be specified"}, { "type": "close", "name": "Close" } ] });
    return;
  }

  this._opts.serialPortName = params.serialPortName;
  if(params.cosmSend == "true") {
    this._opts.cosmSend =  true;
  } else {  
    this._opts.cosmSend =  false;
  }
  this._opts.cosmSendMins = parseInt(params.cosmSendMins);
  this._opts.cosmFeedId = params.cosmFeedId;
  this._opts.cosmApiKey = params.cosmApiKey;
  this.save();

  cb(null, {"finish": true});
};