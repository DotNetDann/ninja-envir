Current Cost EnviR Power Meter
===

## Usage
```
This Ninja Block module is installed on your ninja block (http://www.ninjablocks.com/)
It will read the serial commands from your Current Cost EnviR power meter's serial port
You can use the EnviR's serial cable(http://www.currentcost.com/product-envir.html) or use the on-board beagle serial
It will upload your current usage every 6 seconds when the unit sends data.
This will then show in your Ninja Block dashboard and you will be able to make rules based upon your household power usage
You also have the option to send the data to Cosm (replicating the bridge device)
```

## Installation
```
cd /opt/ninja/drivers/
rm -rf ninja-envir
git clone https://github.com/DotNetDann/ninja-envir.git ninja-envir
sudo service ninjablock restart
```
