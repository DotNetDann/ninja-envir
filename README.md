Current Cost EnviR Power Meter
===

## Usage
This Ninja Block driver is installed on your ninja block (http://www.ninjablocks.com/)
It will read the serial commands from your Current Cost EnviR power meter's serial port (http://www.currentcost.com/product-envir.html)
You can use the EnviR's serial cable or use the on-board beagle serial pins.
It will upload your current usage every 6 seconds when the unit sends data.
This will then show in your Ninja Block dashboard and you will be able to make rules based upon your household power usage
You also have the option to send the data to Cosm (replicating the bridge device)

## Installation
Log into the Ninjablock via SSH 
```
  $ cd /opt/ninja/drivers/
  $ rm -rf ninja-envir
  $ git clone https://github.com/DotNetDann/ninja-envir.git ninja-envir
  $ sudo service ninjablock restart
```
You will then be able to edit any settings via the drivers configuration on the Ninja Dashboard. (Any changes require a restart)

## Ninjablock Dashboard
![ScreenShot](https://raw.github.com/DotNetDann/ninja-envir/master/Dashboard.png)

## Serial Communications
By default the driver will expect the USB cable that came with the EnviR (ttyUSB0)
You have the option to use the serial pins on the board.

On the beagle bone (http://beagleboard.org/bone)
You can use serial port name 'ttyO5' which is on-board Serial 5 (http://www.jerome-bernard.com/blog/2012/06/04/beaglebone-serial-ports-and-xbees/)

NOTE: You need to put these lines in /etc/rc.local
```
  echo 4 > /sys/kernel/debug/omap_mux/lcd_data8
  echo 24 > /sys/kernel/debug/omap_mux/lcd_data9
```
Then use this pin diagram to wire directly to the EnviR
```
   CC128		Beagle Bone			Cat5 Wire Colour	Notes
  ---------------------------------------------------------------------------------
 	Pin 1		Pin P9-01 or 02  	Blue				Gnd
 	Pin 4		Pin P9-03 or 04 	Green Stripe		3.3v
 	Pin 7		Pin P8-37			Brown Stripe		Serial Data (Optional)
 	Pin 8		Pin P8-38			Brown				Serial Data
```