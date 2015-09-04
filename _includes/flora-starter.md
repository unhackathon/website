### What is a microcontroller, anyway?

A microcontroller is nothing more than a very small, low powered computer on a chip. They are generally small enough to run off of no more than the USB power off you computer or a few triple-A batteries, and they tend to have very little processing power, with clock speeds measuring in the MegaHertz. However, because of their simple instruction set and lower power consumption, they are very useful in applications where something needs be constantly running, whether on wall power or batteries. 

Microcontrollers deal with their relative lack of power in several ways. The first is that in general microcontrollers never run an operating system. Code is run directly on the hardware, and only one program at a time is running, giving it complete control over system memory. Because of the need for complete control, microcontroller software is written in C/C++, ensuring that every byte of memory is counting for, as most microcontrollers only have a few KB (Yes, you read that correctly) of memory. Even though the microcontrollers lack the power of modern day computers or even your phone, because of their durability, versatility, and affordability (around $20 for a whole board), they are frequently used in DIY electronics and art projects. 

Most hobyists don't use microcontrollers directly. Instead, they are generally mounted on a printed circuit board, which has headers[note here?] or easily solderable connectors to interface with the board (more on that later). They also generally have a USB port to allow the chips to be easily reprogrammed from a computer. All of these connections let us connect all sorts of fun devices to our microcontroller, including: 

* switches
* buttons
* LEDs
* keypads
* sensors (heat, accelerometer, etc)
* LCD screens
* And many more...



https://www.arduino.cc/en/Reference/SPI

### What about Wearables?

Wearables have become much more of a trend among arduino enthusiasts with the advent of the modern commercial wearables. In particular, it has become easier and easier to build wearable 

### Introducing, the Flora!

The Flora is an arduino compatible microcontroller board specifically designed for use in wearables. The first thing to notice about the flora is that rather then using socket headers, which are great for inserting stiff solid-core wire or jumper wires, it provides fat connection plates spaced wide around the board. These connections aren't very useful for wires, but are excellent for both alligator clips, and another favorite of the wearable community: conductive thread.

Conductive thread is thread that is generally made of steel, and which can be used to stitch traces between components into clothing. There are multiple design features of the Flora that make it easier to use conductive thread with it. The wide spacing on the plates on the flora make it easy to wrap conductive thread around them and tie it off, while avoiding shorting the connectors together. In addition, there are both 3.3V outputs and grounds interspersed throughout the board, meaning that you don't have to cross over other threads to get power. This is important because the threads themselves don't have insulation, so cross-overs are basically difficult to impossible.

You'll also notice one more subtle feature of the Flora that makes it great to use in wearable products, which is that there are no wires poking out the bottom. Even if you've never dealt with microcontrollers, you make have seen other printed circuit boards with pokey bits from soldered on chips sticking out the backside. There are reasons why chips are normally manufactured this way, but with the Flora, Adafruit avoided that to prevent it from snagging on clothing or your skin.   

### Get the Arduino IDE

The use of microcontrollers really took off with the Arduino, which packaged the programming environment and the board in an inexpensive package. We will be using a different board, but it is still based on the same chip and architecture used by Arduino (check this). This also means we can use the same programming environment as well. 

You should download the Arduino IDE at (URL HERE), or you can grab one of our USB keys preloaded with it. Installing the IDE should be as simple as unpacking the zip file in which it is packaged and running the program.

##### Install the Flora drivers

Before we can write or hello world program for the Flora, we first need drivers to upload code to the board. The newest versions of the Arduino IDE make it super easy to install drivers for new devices. In order to do this, you should find the preferences menu (Under "Arduino" on OS X, and "File" for Windows/Linux). Once in the preferences menu, add `https://adafruit.github.io/arduino-board-index/package_adafruit_index.json` to Additional Boards Manager URLs. 

Once that is done go to Tools -> Boards -> Boards Manager, and search for "adafruit". You should see an entry for "Adafruit AVR boards". Click on it and install it.

Once that is done, close and reopen the Arduino IDE, and you're ready to start hooking things up. 

### A basic test project

Our very first hello world will be to make the LED light on the Flora flash on and off. In order to do this, we're going to create a new "sketch" (basically another name for "program") in the arduino IDE. If there isn't already a window open to start coding in, just go to file -> new, and then save your sketch as "blinker". Once that is done, edit the code to look like the following.

{% highlight c++ %}   
void setup() {
  // put your setup code here, to run once:
}

//LED is always pin 7 on the Flora
#define LED 7

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println("Hello, World!");
  digitalWrite(LED, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(500);               // wait for 500 milliseconds
  digitalWrite(LED, LOW);    // turn the LED off by making the voltage LOW
  delay(500);               // wait for 500 milliseconds
}
{% endhighlight %}

As you'll see, the arduino environment wants to implement two functions. The first, setup, is run once when the microcontroller boots up. The second, loop, is run continuously. You can think of it a little like having the following C main:

{% highlight c %}
int main(void) {
    setup();
    while (true) {
        loop();
    }
}
{% endhighlight %}

There are a couple of interesting things to note here. The first is that we simply use the number "7" to represent the LED itself. On the Flora, each connection to the chip is given a number, with different numbers representing different pins. In this case, the number 7 doesn't represent an external connection, but a pin that is hardwired onto the board as going to the LED. If you look closely at the board, some of the conectors are labeled with numbers such as 'D6'. In general, these numbers correspond to the number that represents the connector in the programming environment.

The next thing to note is that there are some built in classes and commands in our environment that are useful. The first thing we do in our loop is print "Hello, World!", on the Serial line. This Serial class corresponds to the serial connection back to the computer when the USB connector is plugged in. You can send any bytes you want to over this connection, but here we are simply sending the bytes corresponding to the string "Hello, World!" 

The next builtin function is the digitalWrite function. this function outputs either a high voltage (ON/1/true) or a low voltage (OFF/0/false) on a pin. In this case high/low corresponds to whether the on-board LED should be on or not. 

The final useful built-in is the delay function. This simply pauses the code execution for the specified number of milliseconds. 

#### Running the code

Now that we understand what the code should do, we should try running it and seeing if it behaves as expected. The first order of business is to plug a micro-USB cable into your Flora. There should be a green LED that turns on. It is also possible that there is a program pre-loaded onto the Flora that causes the red LED to blink. This is normal. 

Once the Flora is connected to the computer, we will need to actually perform the code upload. In the Arduino IDE, go to Tools -> Port, and look for the port that mentions the "Adafruit Flora". It should probably also be the one that makes a reference to 'USB' in the name. Once that port is selected, click the Arrow button to upload the code to the Flora. Your computer on the Flora should think for a bit, and eventually you should see your code running

Side note?
Remember those "Serial.println" calls from the code above? You can view the output of those calls using the serial viewer in Tools -> Serial Monitor

### Let's do some color

The Flora doesn't only have an onboard LED. It also has a full color NeoPixel, which is a collection of LEDs that can display any level of brightness and any color. As you can imagine, you can do much more exciting things with color and brighness than with just an on/off LED. We're going to do some fading of colors.

The first order of business is to install the relevant library to use the NeoPixel. To do this, simply go to sketch -> Include Library -> Manage Libraries and search for and install the Adafruit NeoPixel library. Once that is done, we're going to start with emulating our blinking light with the NeoPixel. 

Type the following code into the arduino IDE, either in a new sketch or in the current one where you wrote the original blinking code.

{% highlight c++ %}
#include <Adafruit_NeoPixel.h>

// The NeoPixel is on Pin 8 on the Flora
#define PIN 8

// The first parameter represents the number of Neopixels, the second is the pin.
// The third is the format of the data we send it.
Adafruit_NeoPixel strip = Adafruit_NeoPixel(1, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  // put your setup code here, to run once:
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
}

void loop() {
  // put your main code here, to run repeatedly:

  //These color values are in RGB, and can go up to 255, but that's way to bright.
  strip.setPixelColor(0, strip.Color(50, 50, 50));
  strip.show();
  delay(500);               // wait for 500 ms
  strip.setPixelColor(0, strip.Color(0, 0, 0));
  strip.show();
  delay(500);               // wait for 500 ms
}
{% endhighlight %}

You'll notice that in this case, we have an actual object, on which we can call methods such as setPixelColor and show, rather than simply writing to a number that represented a particular pin. In this case, the NeoPixel library is hiding all of those details away from us. If you run this code you'll see the NeoPixel blinking. It's much brighter than the previous LED, to the point where it's painful to look at in this case we only use a brightness value of 50 for each color instead of 255. 

But of course, just blinking is boring, so lets add some transitions. Add the following before your loop function:
{% highlight c++ %}
int red = 50; // Set this to 255 for full strength.
int green = 0; 
int blue = 0;
void displayColors() {
  strip.setPixelColor(0, strip.Color(red, green, blue));
  strip.show();
}
{% endhighlight %}

And change your loop function to match the following:

{% highlight c++ %}
void loop() {
  while (red > 0) {
    displayColors();
    red--;
    green++;
    delay(100);
  }
  while (green > 0) {
    displayColors();
    green--;
    blue++;
    delay(100);
  }
  while (blue > 0) {
    displayColors();
    blue--;
    red++;
    delay(100);
  }
}
{% endhighlight %}

Now, when you upload the sketch, you should see a light that slowly changes color between red, green, and blue. Take some time and tamper with the pixel color settings in any way you like.
