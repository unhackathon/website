---
layout: springboard
title: Websockets
---

## Introduction to Websockets

Websockets have enabled web apps to be much more concurrent in a scalable fashion, allowing for a push based model instead of a pull based model. In earlier days of web apps, when XmlHttpRequests were still new and exciting, the only way to communicate with your server was by sending web requests. If you wanted to get updates from the server, you generally had to repeatedly request updates, which was generally wasteful and made it difficult to write well synchronized web apps. All this has changed with the advent of Websockets.

Websockets provide an interface similar to a TCP socket, except in the web browser. Essentially, the client and server can both send messages at any time they want, and the other party will get woken up to handle the message. This is far more efficient than polling repeatedly, and is what makes the functionality of modern web apps such as Trello and Slack possible.

### Getting started with Go

In this project we will create a simple shared drawing app using Go, javascript, and websockets. In particular, languages such as Go show their strength incredibly well at executing highly concurrent code.

Google provides binary packages for GoLang at their website. On OS X and Windows you can set 

OS X and LINUX:
{% highlight bash %}
#env.sh
export PATH=/usr/local/go/bin
export GOPATH=~/godraw/
{% endhighlight %}
Windows:
{% highlight powershell %}
#env.ps1
$env:Path = $env:Path + ";C:\go\bin"
$env:GOPATH = /Users/{name}/godraw/
{% endhighlight %}

On linux you can run "`. env.sh`"" to source the environment file. On windows run "`./env.ps1`" to run the powershell file 

If all goes well, you should see the following when you run 'go' on the shell.
[code]
Go is a tool for managing Go source code.

Usage:

    go command [arguments]
...
[/code]

Starting a project in Go
------------------------

Go follows a very strict directory structure, which you can read about [here]. In essence, the positions of everything under $GOPATH are proscribed by go. This is limiting in the sense that you can't set special build directories, but freeing because you don't have to worry about build tools disagreeing about how to compile code and where
https://golang.org/doc/code.html

Here is the example from the above page:
```
bin/
    hello                          # command executable
    outyet                         # command executable
pkg/
    linux_amd64/
        github.com/golang/example/
            stringutil.a           # package object
src/
    github.com/golang/example/
        .git/                      # Git repository metadata
    hello/
        hello.go               # command source
    outyet/
        main.go                # command source
        main_test.go           # test source
    stringutil/
        reverse.go             # package source
        truncate.go
        reverse_test.go        # test source
```

All go source code goes into the src directory. You'll see that the files in hello and outyet are compiled into binaries, while the files  in stringutil are compiled into a package. Go determines whether files consitute a command or a package based on whether they are listed as being in package "main" and whether they contain a "main" function.

To start our project, we are going to create a file called "main.go" in folder "godraw" under the "src" directory of our $GOPATH.
```
package main

import "net/http"
import "fmt"

func main() {
    http.Handle("/", http.FileServer(http.Dir(".")))
    fmt.Println("Running webserver on port 8080")
    http.ListenAndServe(":8080", nil);
}
```

You'll see that this file lists itself as being package 'main'. We'll get to that more later. For now, once you have written this file, run `go run main.go`.


Dive into HTML
-----------

In order for our drawing app to work, we're going to need a web based client. This means 3 things, HTML, javascript and css. Create a folder called "public" in your "godraw" folder. This folder should have three files: index.html, main.js, and styles.css, with the following contents:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>
    <h1 id="header"></h1>
  </body>
  <script src="main.js"></script>
</html>
{% endhighlight %}
{% highlight javascript %}
document.getElementById("header").innerHTML = "Hello World!"
{% endhighlight %}
{% highlight css%}
h1 {
    color: red;
}
{% endhighlight %}
Also, because we're now serving from the 'public' folder, modify your main function in main.go so that it serves the appropriate folder.
{% highlight go %}
...
func main() {
    http.Handle("/", http.FileServer(http.Dir("public")))
    fmt.Println("Running webserver on port 8080")
    http.ListenAndServe(":8080", nil);
}
...
{% endhighlight %}

Now when you run main.go, and hit localhost:8080, you should see a red "Hello, World!" appear. This verifies that your html, javascript, and css are being served properly.


### Javascript drawer

As our next step, we need the actual 'drawing' part of our application. We will be using a javascript "canvas" element to custom drawing. Canvases come in two flavors, 2D and 3D, but since we're just creating a drawing App, we will stick to the 2D version for now. F

For the HTML, we just need to have a plain 'canvas' element on a blank page.
{% highlight html %}
...
  <body>
    <canvas id="canvas"></canvas>
  </body>
...
{% endhighlight %}

And we can use CSS to center everything in the center of the page.

{% highlight css %}
body {
    background: #aaa;
}

#canvas {
    width:400px;
    height:400px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid #555;
    display: block;
    background: white;
}
{% endhighlight %}

However, since drawing is interactive, most of the meat of the experience is in the javascript. 

{% highlight javascript %}
(function () {
    "use strict"
    var canvas = document.getElementById("canvas");
    canvas.width = 400;
    canvas.height = 400;
    var context = canvas.getContext("2d")
    var mouseIsDown = false;

    function point(centerX, centerY) {
        radius = 5;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 0;
        context.strokeStyle = 'green';
        context.stroke();
    }

    var top = canvas.offsetTop;
    var left = canvas.offsetLeft;

    function mouseMove(evt) {
        if (mouseIsDown) {
            point(evt.pageX - left, evt.pageY - top);
        }
    }

    canvas.addEventListener("mousedown", function () {
        mouseIsDown = true;
        canvas.addEventListener("mousemove", mouseMove);
    });

    window.addEventListener("mouseup", function () {
        mouseIsDown = false;
        canvas.removeEventListener("mousemove", mouseMove)
    });
})();
{% endhighlight %}

This is a bit of a mouthful, so let's go through it step by step.


{% highlight javascript %}
    var canvas = document.getElementById("canvas");
    canvas.width = 400;
    canvas.height = 400;
    var context = canvas.getContext("2d")
    var mouseIsDown = false;
    var counter = 0;
{% endhighlight %}

The first part mostly sets up variables. We get the canvas element, and explicitely set its width and height to 400. This is important, because the drawing space of the canvas is determined by the explicit width and height on the element, and NOT the compted width and height in CSS. The 4th line is a little javascript incantation to get an object you can actually use to _draw_ on the canvas.

{% highlight javascript %}
    function point(centerX, centerY) {
        radius = 5;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 0;
        context.strokeStyle = 'green';
        context.stroke();
    }
{% endhighlight %}

This next part is the function to draw a point. It takes the positions we need, and draws a circle using the context's "arc" method. You'll see that we do this by drawing an arch around the point with an angle from 0 to 2PI, which completes the circle. The final "false" parameter indicates whether to draw clockwise or counterclockwise, which doesn't matter for us.

The remaining lines just indicate the fill and stroke color, as well as the line width. The stroke indicates the color of the line surrounding the arc, and the fill indicates the color inside the arc. Finally, we have the line width, which is set to 0 since there is no point in making the circle bigger then our intended radius by having a stroke on the outside.

{% highlight javascript %}
    var top = canvas.offsetTop;
    var left = canvas.offsetLeft;

    function mouseMove(evt) {
        if (mouseIsDown) {
            point(evt.pageX - left, evt.pageY - top);
        }
    }
{% endhighlight%}

This is the code that handles drawing our circles. If the mouse is down, it draws a circle where the mouse is. In order to do it, we need to compute the position relative to the top-left corner of our canvas, which we can do by subtracting the canvas' position on the page from the mouse's position on the page.

{% highlight javascript %}
    canvas.addEventListener("mousedown", function () {
        mouseIsDown = true;
        canvas.addEventListener("mousemove", mouseMove);
    });

    window.addEventListener("mouseup", function () {
        mouseIsDown = false;
        canvas.removeEventListener("mousemove", mouseMove)
    });
{% endhighlight %}

Finally, we add two event listeners, one to tell us when the mouse has been clicked in the canvas, and another to tell us if the mouse has been released anywhere on the window. This handles the case where someone clicks on the canvas and drags off it, releasing the mouse button. We add and remove the mouseMove handler depending on whether the mouse is down or not, so that we can avoid the expense of running extra javascript whenever the mouse moves, even if you're not dragging.

Finally, you may have wondered why the whole javascript file is wrapped in 
{% highlight javascript %}
(function () {
    ...
})()
{% endhighlight %}

This is simply an anonymous function that is immediately called after it is created. It is used in javascript so that variables declared inside the function don't leak out into the global scope and conflict with other names. Transpiled languages such as coffescript do this automatically for you.

A real server
--------------

The next part of this project will involve writing a websocket server that simply echoes the points you want to draw back on the same websocket. Once this is done, we will know that the client side of our drawing project will draw whatever it receives over the socket, and all that will be left is writing the server-side code to relay drawing commands to multiple pelople.

The first order of business is to make sure that we can handle WebSocket connections. We're going to need to install the websocket module, which you can do by running `go get golang.org/x/net/websocket`

Next we define a function "socketConnected" that will ensure that we can in fact handle inbound websocket connections.

{% highlight go %}
func socketConnected(ws *websocket.Conn) {
    fmt.Println("Socket connected")
}{% endhighlight %}

And add the following line to the top of your main function.


{% highlight go %}
http.Handle("/socket", websocket.Handler(socketConnected));
{% endhighlight %}

In your javascript code, simply add the line
{% highlight javascript %}
    var ws = new WebSocket("ws://" + window.location.host + "/socket");
{% endhighlight %}
in the same area where you set up your context for drawing.

Now, restart the go server. Every time you load the page, the go program should print "Socket connected".

Now that we have a websocket, we need the ability to send and receive points.

Add the following type to your main.go file:

{% highlight go %}
type point struct {
    X float64 `json:"x"`
    Y float64 `json:"y"`
}
{% endhighlight %}

This struct will be used to parse and send messages that represent points. In particular, this uses a language feature in go called 'tags'. You'll notice that X and Y are each 'tagged' with info to the JSON parset that tells it what name to deserialize and serializze properties to. This is necessary because we want X and Y on the point itself to be public, and in Go, public members have to start with an uppercase letter.

Finally, to finish off our changes to the go server, remove the "socketConnected" function, and add the following function. 
{% highlight go %}
// Echo the data received on the WebSocket.
func echoServer(ws *websocket.Conn) {
    var p point
    //Make sure we close before we leave the function
    defer ws.Close()
    for ;; {
        var err = websocket.JSON.Receive(ws, &p)
        if (err != nil) {
            return
        }
        err = websocket.JSON.Send(ws, p)
        if (err != nil) {
            return
        }
    }
}
{% endhighlight %}

Then change the websocket handler to use this function as well.

{% highlight go %} http.Handle("/socket", websocket.Handler(echoServer)); {% endhighlight %}


Finally, your Go code should look like this:

{% highlight go %}
package main

import "net/http"
import "fmt"
import "golang.org/x/net/websocket"

type point struct {
    X float64 `json:"x"`
    Y float64 `json:"y"`
}

// Echo the data received on the WebSocket.
// Echo the data received on the WebSocket.
func echoServer(ws *websocket.Conn) {
    var p point
    //Make sure we close before we leave the function
    defer ws.Close()
    for ;; {
        var err = websocket.JSON.Receive(ws, &p)
        if (err != nil) {
            return
        }
        err = websocket.JSON.Send(ws, p)
        if (err != nil) {
            return
        }
    }
}

func main() {
    http.Handle("/socket", websocket.Handler(echoServer));
    http.Handle("/", http.FileServer(http.Dir("public")))
    fmt.Println("Running webserver on port 8080")
    http.ListenAndServe("localhost:8080", nil);
}
{% endhighlight %}

This server will echo the points it recieves over the websocket connection back to the client websocket.

The client side drawing code
---------------------
That is all well and good, but our client still doesn't know how to deal with messages from the server. The only two changes we need to make to have a working networked drawing client are have the client send the message to the server when you click and drag, and to do the actual drawing when it recieves a messages from the server.

Modify the code in mouseMove to look like this:
```
function mouseMove(evt) {
        if (mouseIsDown) {
            ws.send(JSON.stringify({
                x: evt.pageX - left,
                y: evt.pageY - top,
            }))
        }
    }
```
This tells mouseMove to serialize the javascript object into JSON so that we can send it to our server. Note that the 'x' and 'y' are lowercase, matching the tags we set up in go earlier.
Now we send the messages whenever the mouse is moved, but we never actually draw the point if we get a message. 

Add the following code anywhere after the websocket is setup

```
    function messageRecieved(evt) {
        var point = JSON.parse(evt.data);
        drawPoint(point.x, point.y);
    }
    ws.onmessage = messageRecieved;
```
This tells the websocket that any time it recieves a message, it should call the messageRecieved function, which will take the message that it got, deserialize it to a point, and then pass it to the drawPoint method.

What this means is that any time we draw in a program, we send a message to the server, and wait to draw until we get the echoed message back. This is inneficient for a single user, but makes programming a multi-person drawing program much simpler.

Your client code should now look like this.

{% highlight javascript %} 
(function () {
    "use strict";
    var canvas = document.getElementById("canvas");
    canvas.width = 400;
    canvas.height = 400;
    var context = canvas.getContext("2d")
    var mouseIsDown = false;
    var counter = 0;
    var ws = new WebSocket("ws://" + window.location.host + "/socket");

    function messageRecieved(evt) {
        var point = JSON.parse(evt.data);
        drawPoint(point.x, point.y);
    }
    ws.onmessage = messageRecieved;

    function drawPoint(centerX, centerY) {
        radius = 5;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 0;
        context.strokeStyle = 'green';
        context.stroke();
    }

    var top = canvas.offsetTop;
    var left = canvas.offsetLeft;

    function mouseMove(evt) {
        if (mouseIsDown) {
            ws.send(JSON.stringify({
                x: evt.pageX - left,
                y: evt.pageY - top,
            }))
        }
    }

    canvas.addEventListener("mousedown", function () {
        mouseIsDown = true;
        canvas.addEventListener("mousemove", mouseMove);
    });

    window.addEventListener("mouseup", function () {
        mouseIsDown = false;
        canvas.removeEventListener("mousemove", mouseMove)
    });
})();
{% endhighlight %}
