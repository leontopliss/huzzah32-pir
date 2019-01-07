load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_timer.js');
load("api_adc.js");

let pirSensorPin = 21;
let batteryPin = 35;  // Huzzah32 Battery Voltage is on Pin 35

let topic = '/devices/' + Cfg.get('device.id') + '/events';

function pirStateChangedCallback(){
  let msg = JSON.stringify({ motion: GPIO.read(pirSensorPin) });
  let ok = MQTT.pub(topic, msg, 1);
  print(ok, msg);
}

GPIO.set_int_handler(pirSensorPin, GPIO.INT_EDGE_ANY, pirStateChangedCallback, null);
GPIO.enable_int(pirSensorPin);


// Send the battery status every 1 hour.
ADC.enable(batteryPin);
Timer.set(3600000 /* 1 hour */ , true /* repeat */ , function () {
  let voltage = (ADC.read(batteryPin)/4095)*2*3.3*1.1;
  let msg = JSON.stringify({
   data: {
     voltage: voltage 
   }
  });
  let ok = MQTT.pub(topic, msg, 1);
  print(ok, msg);
}, null);
