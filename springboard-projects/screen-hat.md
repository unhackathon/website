---
layout: springboard
title: LCD on a hat
---
{% include flora-starter.md %}


### Our other components

For this project we will also be using two other components. The first is a Bluetooth Low Energy module, which is meant to be used in wearables. You'll notice that it has a similar design profile to the Flora, and in particular, when we get to wiring it, you'll see that the connection plates match up nicely with the Flora, again avoiding those annoying crossovers.

The other component we will be using is a 1.44 inch low-power LCD screen. This screen was not originally setup for wearable use, so we will be creating metal loops that we can then spread apart to interface with our conductive thread. In addition, we've already pre-soldered a header onto the board so that you can stick wires in without having to solder all your wires on.

### Loop making

Now it's time for some actual hardware wiring. As I mentioned earlier, the breakout board for the LCD screen does not have wearable friendly wires for it, so we're going to have to make some. This will entail stripping solid core wire, bending it into a hoop, and sealing it into a loop using crimping beads. You'll need 7 wires total, and we have 6 colors of wire, so I recommend picking one that will be your extra. 

##### Step 1: Strip the wire
Use the largest hole on the wire strippers to pull off about an inch of insulation on one end of the wire for the loop, and a quarter inch on the other end to go into the header socket.

##### Step 2: bend the wire into a loop

Use the pliers to bend the wire into a loop, first bending out, then bending gently in each place along the wire to get a clean loop.

##### step 3: Add crimping bead and crimp. 
Thread the crimping bead onto the other end of the wire and over the end of the loop, then smash it down with your pliers.

### Connections to be made (LCD)

Now we get to the actual connections to be made with the LCD. For the finished product we would like to use thread, but that is hard to test on a table since there is nothing stopping the thread from sliding together and shorting the connection. Therefor, we will be using alligator clips for testing, and only sewing into a hat after all the connections are figured out. 

First plugin al of your wires to the LCD board as in the diagram. Note that red goes to the Vin and black goes to ground, this is wiring convention.

Next, disconnect your Flora from power and alligator clip the wires on the board to the following plates on your Flora, matching the diagram:

Vin -> 3.3V
Gnd -> Gnd
SCK -> SCL
SI -> D10
TCS -> D9
RST -> D6
DC -> D12

When you reconnect your Flora to your laptop, the LCD should be backlit with nothing displayed on it.

### Graphics library + example program.

We'll need to download another library to use the display device. Go to Sketch -> Include Library -> Manage Libraries and search for 'ST7735', then add the Adafruit ST7735 library. After that, search again, this time for Adafruit GFX Library.

Next we're going to develop from an example: Go to File-> Examples, and select the 'graphicstest' example under 'Adafruit ST7735 library'. Once you load it, you should immediately save. The arduino IDE will then prompt you to pick a new save location so that you can make the example your own.

[Image here]
##### Slight modifications
The pins we're planning on using don't match up with the sample programs' pins, so we're going to need to modfy them. Change the define statements at the top of the file to match the following
{% highlight c++ %}
// For the breakout, you can use any 2 or 3 pins
// These pins will also work for the 1.8" TFT shield
#define TFT_CS     9
#define TFT_RST    6  // you can also connect this to the Arduino reset
                      // in which case, set this #define pin to 0!
#define TFT_DC     12
{% endhighlight %}

We're also going to be using software SPI instead of hardware SPI, so we'll need to comment the uncommented line under "Option 1", and uncomment the line under Option 2. In addition, we'll want to modify the define directives to match up with the pins you have chosen. All-in-all, it should look like this:

{% highlight c++ %}
// Option 1 (recommended): must use the hardware SPI pins
// (for UNO thats sclk = 13 and sid = 11) and pin 10 must be
// an output. This is much faster - also required if you want
// to use the microSD card (see the image drawing example)
//Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS,  TFT_DC, TFT_RST);

// Option 2: use any pins but a little slower!
#define TFT_SCLK 3   // set these to be whatever pins you like!
#define TFT_MOSI 10   // set these to be whatever pins you like!
Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_MOSI, TFT_SCLK, TFT_RST);

{% endhighlight %}

Now, try uploaded the script. If all went well, you should see some patterns and some text. Things will be fairly slow because we're using software SPI instead of hardware API, but the whole set of graphics shouldn't take more than a couple minutes to run. 

### Connections to be made (BLE device)

Luckily our bluetooth device is made to work perfectly with the RX/TX ports on the Flora. Simply connect the wires according to the diagram using alegator clips. 

### Bluetooth libraries + program

These libraries can also be installed using the library manager. Simply look for Adafruit BluefruitLE nRF51 library and install it. We will again be basing our code off of an example, but in this case it will be based off of the Adafruit BlueFruitLE nRF51 -> bleuart_datamode example. 

When you load up this example you'll notice that there are a couple files. Much of the configuration for the board lives in BlueFruitConfig.h. The main two items you'll want to change are to change the value of BLUEFRUIT_UART_MODE_PIN to -1 since we don't use it at all (you'll note that we didn't wire up the mode plat on the bluetooth chip), and to also remove the ifdef around `#define BLUEFRUIT_HWSERIAL_NAME      Serial1`. The other pin settings should be correct if you wired the module the same as the diagram.

Once those changes are done, you should be able to upload the sketch to the Flora. Unfortunately, Bluetooth libraries aren't very useful without someone to bluetooth with.

#### Bluefruit app

The easiest way to interface with the Bluetooth LE device is to use the Adafruit Bluefruit app. It is available for iOS and android, and it's fairly small, so download it from your App store of choice now.

Once the app is downloaded, open it and connect to the 'Adafruit Flora BLE' device. Your device name should have a unique number next to it and should be the strongest signal, so make sure you always connect to that one so there is no crosstalk between bluetooth devices. When you connect, you should pick the "UART" connection mode.

Once you have done that, you should also open the Serial Monitor (Tools -> Serial Monitor). You should see a message about "Switching to DATA mode!" If you see that, then you can start typing in the text field in your phone, and the characters you type should show up in the Serial Monitor on your computer.

### Program that displays text sent from Adafruit App

Now that we know both of our components work individually, we're going to do the real programming for this project, which is combining our individual code lego peices into a more powerful whole.

We're going to interleave the chunks of each of our previous sketches, and remove some of the pointless demo cruft that existed in them previously. Either open a new sketch in the Arduino IDE or blank out an existing one. This is going to be fun.

First we need to combine all the header imports so we know that we have all the functions and variables we need. Grab the headers from both the graphics and the bluetooth demo applications and put them at the top of your sketch. You should get something like the following:



{% highlight c++ %}
#include <Arduino.h>
#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library
#include <SPI.h>
#if not defined (_VARIANT_ARDUINO_DUE_X_) && not defined (_VARIANT_ARDUINO_ZERO_)
  #include <SoftwareSerial.h>
#endif
#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"
{% endhighlight %}

{% highlight c++ %}
// For the breakout, you can use any 2 or 3 pins
// These pins will also work for the 1.8" TFT shield
#define TFT_CS     10
#define TFT_RST    9  // you can also connect this to the Arduino reset
                      // in which case, set this #define pin to 0!
#define TFT_DC     3

// Option 1 (recommended): must use the hardware SPI pins
// (for UNO thats sclk = 13 and sid = 11) and pin 10 must be
// an output. This is much faster - also required if you want
// to use the microSD card (see the image drawing example)
Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS,  TFT_DC, TFT_RST);

// Option 2: use any pins but a little slower!
#define TFT_SCLK 12   // set these to be whatever pins you like!
#define TFT_MOSI 6   // set these to be whatever pins you like!
//Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_MOSI, TFT_SCLK, TFT_RST);

float p = 3.1415926;

// COMMON SETTINGS
// ----------------------------------------------------------------------------------------------
// These settings are used in both SW UART, HW UART and SPI mode
// ----------------------------------------------------------------------------------------------
#define BUFSIZE                        128   // Size of the read buffer for incoming data
#define VERBOSE_MODE                   true  // If set to 'true' enables debug output

#define BLUEFRUIT_HWSERIAL_NAME      Serial1
#define BLUEFRUIT_UART_MODE_PIN        -1    // Set to -1 if unused
/* ...or hardware serial, which does not need the RTS/CTS pins. Uncomment this line */
Adafruit_BluefruitLE_UART ble(BLUEFRUIT_HWSERIAL_NAME, BLUEFRUIT_UART_MODE_PIN);

// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

void setupBluefruit(void)
{
  while (!Serial);  // required for Flora & Micro
  delay(500);

  Serial.println(F("Adafruit Bluefruit Command <-> Data Mode Example"));
  Serial.println(F("------------------------------------------------"));

  /* Initialise the module */
  Serial.print(F("Initialising the Bluefruit LE module: "));

  if ( !ble.begin(VERBOSE_MODE) )
  {
    error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }
  Serial.println( F("OK!") );

  /* Disable command echo from Bluefruit */
  ble.echo(false);

  Serial.println("Requesting Bluefruit info:");
  /* Print Bluefruit information */
  ble.info();

  ble.verbose(false);  // debug info is a little annoying after this point!

  /* Wait for connection */
  while (! ble.isConnected()) {
      delay(500);
  }

  Serial.println(F("******************************"));

  // Set module to DATA mode
  Serial.println( F("Switching to DATA mode!") );
  ble.setMode(BLUEFRUIT_MODE_DATA);

  Serial.println(F("******************************"));
}

void testdrawtext(char *text, uint16_t color) {
  tft.setCursor(0, 0);
  tft.setTextColor(color);
  tft.setTextWrap(true);
  tft.print(text);
}

void setupScreen(void) {
  Serial.begin(115200);
  Serial.print("Hello! ST7735 TFT Test");

  // Use this initializer (uncomment) if you're using a 1.44" TFT
  tft.initR(INITR_144GREENTAB);   // initialize a ST7735S chip, black tab

  Serial.println("Initialized");

  uint16_t time = millis();
  tft.fillScreen(ST7735_GREEN);
  time = millis() - time;

  // large block of text
  tft.fillScreen(ST7735_BLACK);
  testdrawtext("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur adipiscing ante sed nibh tincidunt feugiat. Maecenas enim massa, fringilla sed malesuada et, malesuada sit amet turpis. Sed porttitor neque ut ante pretium vitae malesuada nunc bibendum. Nullam aliquet ultrices massa eu hendrerit. Ut sed nisi lorem. In vestibulum purus a tortor imperdiet posuere. ", ST7735_WHITE);
}

// Pin D7 has an LED connected on FLORA.
// give it a name:
int led = 7;
 
// the setup routine runs once when you press reset:
void setup() {                
  // initialize the digital pin as an output.
  pinMode(led, OUTPUT);
  Serial.begin(9600);
  Serial.print("Hello! ST7735 TFT Test\n");  
  setupScreen();
  setupBluefruit();
  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(0, 0);
  tft.setTextColor(ST7735_WHITE);
  tft.setTextWrap(true);
}
 
// the loop routine runs over and over again forever:
void loop() {
    // Check for user input
  char n, data[BUFSIZE+1];
  int index = 0;
  // Echo received data
  while ( ble.available() )
  {
    data[index] = ble.read();
    index++;
  }
  data[index] = '\0';
  tft.print(data);
}
{% endhighlight %}

### Sewing to the hat

### Other expansion options

#### Link to Adafruit 