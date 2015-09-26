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

The first order of business is to make sure that we can handle WebSocket connections. We're going to need to install the Gorilla WebSocket module, which you can do by running `go get github.com/gorilla/websocket`

Next we add a global Upgrader and define a function "websocketHandler" that will ensure that we can in fact handle inbound websocket connections.

{% highlight go %}
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
    socket, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    fmt.Println("Socket connected")
}{% endhighlight %}

And add the following line to the top of your main function.


{% highlight go %}
http.HandleFunc("/socket", websocketHandler);
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

Finally, to finish off our changes to the go server add the following function. 
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

Then change the websocketHandler function to call the echo server on as a new Goroutine (or lightweight thread)

{% highlight go %}
func websocketHandler(w http.ResponseWriter, r *http.Request) {
    socket, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    go echoServer(socket)
}{% endhighlight %}

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

func websocketHandler(w http.ResponseWriter, r *http.Request) {
    socket, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    go echoServer(socket)
}

func main() {
    http.Handle("/socket", websocket.Handler(echoServer));
    http.Handle("/", http.FileServer(http.Dir("public")))
    fmt.Println("Running webserver on port 8080")
    http.ListenAndServe("localhost:8080", nil);
}
{% endhighlight %}

This server will echo the points it receives over the websocket connection back to the client websocket.

The client side drawing code
---------------------
That is all well and good, but our client still doesn't know how to deal with messages from the server. The only two changes we need to make to have a working networked drawing client are have the client send the message to the server when you click and drag, and to do the actual drawing when it receives a messages from the server.

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
    function messageReceived(evt) {
        var point = JSON.parse(evt.data);
        drawPoint(point.x, point.y);
    }
    ws.onmessage = messageReceived;
```
This tells the websocket that any time it receives a message, it should call the messageReceived function, which will take the message that it got, deserialize it to a point, and then pass it to the drawPoint method.

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

    function messageReceived(evt) {
        var point = JSON.parse(evt.data);
        drawPoint(point.x, point.y);
    }
    ws.onmessage = messageReceived;

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

A relay go server
---------------------

Now we want our Go server to relay between all the connected clients. To do this, we're going to set up a few more data structures. First, we're going to create a relayServer type, so that we don't have global state for our server.

{% highlight go %}
type relayServer struct {
    inputChannel chan point
    newConnections chan *clientConnection
    closedConnections chan *clientConnection
    pointsSoFar []point
}

func newServer() *relayServer {
    var server = new(relayServer)
    server.pointsSoFar = make([]point, 0, 1024)
    server.inputChannel = make(chan point)
    server.newConnections = make(chan *clientConnection)
    server.closedConnections = make(chan *clientConnection)
    return server
}
{% endhighlight %}

You'll notice a new type called 'chan' here. Channels are used in go to synchronize individual 'GoRoutines', or lightweight threads of execution. In this case, our server uses channels so that it can hear about new connections, closed connections, and points being input.

Next, we'll need to add a type to manage each connection we receive.

{% highlight go %}
type clientConnection struct {
    server *relayServer
    websocket *websocket.Conn
    outputChannel chan point
}

func newConnection(server *relayServer, ws *websocket.Conn) *clientConnection {
    var conn = new(clientConnection)
    conn.outputChannel = make(chan point)
    conn.server = server
    conn.websocket = ws
    return conn
}
{% endhighlight %}

This connection reverences the previous relayServer type, and also has the websocket connection itself, as well as an output channel so that the server can tell it to output points.

Now we need to write the code that glues all these types together.

For the server, we'll add the following code:

{% highlight go %}
func (server *relayServer) run() {
    var connMap = make(map[*clientConnection]*clientConnection)
    var p point
    var conn *clientConnection
    for ;; {
            log.Println("Waiting for message")
        select {
        case p = <-server.inputChannel:
            log.Println("Message received")
            //Send the point out on all the channels
            for _, conn := range connMap {
                conn.sendMessage(p)
            }
            server.pointsSoFar = append(server.pointsSoFar, p)
        case conn = <-server.newConnections:
            log.Println("Connection added")
            // Send out all the messages we've
            // seen so far to any new connection
            // so that we stay synchronized
            connMap[conn] = conn
            for _, p = range server.pointsSoFar {
                conn.sendMessage(p)
            }
        case conn = <-server.closedConnections:
            log.Println("Connection lost")
            delete(connMap, conn)
        }
    }
}

func (server *relayServer) removeConnection(c *clientConnection) {
    server.closedConnections <- c
}

func (server *relayServer) addConnection(c *clientConnection) {
    server.newConnections <- c
}

func (server *relayServer) handleMessage(p point) {
    server.inputChannel <- p
}


func (server *relayServer) websocketHandler(w http.ResponseWriter, r *http.Request) {
    socket, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }

    var conn = newConnection(server, socket)

    server.addConnection(conn)
    go conn.receiveMessages()
    go conn.sendMessages()
}
{% endhighlight %}

These functions are slightly different from the other style of go functions. You'll notice that they have a type and a name before the function name. This means that the function is a method, and like methods in java or C++, it operates on an object. Only instead of that object being called "this", the object is given its own name in the declaration of the function. In this case, we call it 'server'.

The 'run' function  does two things. Primarily, it sends point messages that it receives  out to the channels on all the clients. Also, any time a new client connects, all the point messages are replayed to that client so that they have all the same drawn points as another client.

The removeConnection, addConnection, and handleMessage methods are all helper methods that put values onto channels. By using channels here instead of directly operating on the data structure, we avoid all the issues with locking inherent in thread based code. There is a single Goroutine actually modifying the data structure, so there can't be data races.

The final interesting method here is websocketHandler, which now tells the connection object itself to start receiving and sending messages.

Now we need to add the methods for the connection object as well.

{% highlight go %}
func (conn *clientConnection) sendMessage(p point) {
    conn.outputChannel <- p
}

func (conn *clientConnection) recieveMessages() {
    defer conn.server.removeConnection(conn)
    var p point
    for ;; {
        log.Println("Recieving message0")
        var err = conn.websocket.ReadJSON(&p)
        log.Println("Recieving message1")
        if (err != nil) {
            log.Print(err)
            return
        }
        log.Println("Recieving message2")
        conn.server.handleMessage(p)
    }
}

func (conn *clientConnection) sendMessages() {
    for p := range(conn.outputChannel) {
        log.Println("Sending message")
        var err = conn.websocket.WriteJSON(p)
        if (err != nil) {
            return
        }
    }
}
{% endhighlight %}

Similar to the server object, we have a helper method to make it easy to send messages. The recieveMessages function sits in an infinit loop and sends any messages it recieves on to the server, while sendMessages listens on the outputChannel for messages to output from the server.

Now, since we've already written the client to rely on data from the server, you should be able ot run your server, and connect to it in two different tabs, or from another computer, and see that everything is synchronized!

### Ideas for expansion

Now that you have drawing synchronized, you can use websockets to synchronize any data you want. You could put images in your canvas, or share urls to background music, or possibly let users SMS in messages that anyone can see. Websockets mean that what one user sees, all users see, creating a fluid and joyful web experience.