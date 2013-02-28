Current Cost EnviR Power Meter
===

## Usage
```
This Ninja Block module is installed on your ninja block (http://www.ninjablocks.com/)
It will read the serial commands from your Current Cost EnviR power meter's serial port (http://www.currentcost.com/product-envir.html)
It will upload your current usage every 6 seconds when the unit sends data.
This will then show in your Ninja Block dashboard and you will be able to make rules based upon your household power usage
```

## Installation
```
1) Download the zip and extract to /opt/ninja/node_modules on your ninja block
2) Get your serial ports name by: 
	$ dmesg | grep tty 
3) Edit index.js and update the serialPortName variable
4) Don't know as I don't have node version 8 on my NB yet...

```



