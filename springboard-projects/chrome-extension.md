---
layout: springboard
title: Chrome Extension
---

# Springboard Project: Chrome Extension

Not everyone is satisfied with functionality in browsers nowadays. In order to
acquire that functionality, people often turn to browser extensions that
functionality in order to accomplish the tasks needed.

Browser extensions aren’t new things - they’ve existed since the late 90s with
Mozilla, and have gradually expanded to include all modern browsers today. But
they used to be undocumented pieces of voodoo - connecting intricately to
internals of a web browser that were more often than not constantly changing.
Nowadays, they are fully documented and often require little more than basic
knowledge of HTML and Javascript (even Firefox!).

This guide will set you up with a basic Chrome extension that mimics the
functionality of the infamous _Cloud-To-Butt_ plugin. In essence, this extension
sits in the background, and whenever it encounters a certain word, it replaces
it with another. We’ll take you through the steps to set up the extension
directory, create the javascript needed to replace “cloud” with “butt”, and then
challenge you later to extend it later with an options menu to enable and
disable the extension.

For reference, you should keep a browser open to the
[Chrome Developer Centre](https://developer.chrome.com/extensions).
It's a good reference to go to should you have any questions on what does what.

**Challenge**: Try this on Firefox! Firefox also offers a powerful extension
system, which not only supports HTML and Javascript, but also the core parts of
their browser, including the UI. In addition, they are planning to support the
Chrome extension API.

## Setting Up
The best place to start is to actually create the extension itself so we can
work with it. There are a lot of good boilerplate generators, or you can create
one yourself by following the directions in Chrome’s documentation. The one this
guide is going to use is [Extensionizr](http://extensionizr.com),
a boilerplate generator.

Start by opening your browser and navigating to `extensionizr.com`. This
site provides a lot of controls, and we won’t go through it in too much detail,
but most options have a help menu attached to them so you can read about it
further.

For our extension, select the following:

* Extension type: Browser action
* Background page: No background
* Options page: No options page
* Override: No Override
* Content scripts: Inject js
* Misc addons: Select none.
* URL permissions: `*://*/\*` (we want all permissions)
* Permissions: Shouldn’t need any, so deselect “Bookmarks” and anything checked.

Now download and extract the generated ZIP file. Chrome seems to think that it's
a dangerous ZIP sometimes, but it's not - we promise! If you're having trouble
downloading the ZIP, you can use our pre-made one
[here](/springboard-projects/chrome-extension/extension.zip).

Let’s see our pre-made extension skeleton! To do so, click options, then
`More tools` and `Extensions`. Enable `Developer mode` at the top of the
extensions page if you haven’t done so already, then click
`Load unpacked extension`. Navigate to the `ext` directory you unpacked earlier
and select it. This should load a new extension,
__CHANGE THIS : Extension boilerplate__. Congrats! You now have a working
extension. But it doesn’t do anything yet!

## Changing "cloud" to "butt"
We need to modify this extension to fit our needs. To do this, it is useful to
have a text editor that supports you every step of the way. Sublime Text
(http://www.sublimetext.com, free evaluation) and Atom (https://atom.io, free)
are two of the most popular text editors that can help you get started. Choose
one and download it, then open it up and navigate to the folder that you
extracted from the ZIP file.

First off, you’ll notice that if you navigate to Google and
open the console, you’ll see the words
`Hello. This message was sent from scripts/inject.js` when it finishes loading.
This exists in “scripts/inject.js”, and proves to us that Chrome is injecting
this javascript into every webpage we visit. Neat, huh? (We'll add other
websites next.)

Every page you visit is called a “document”. The document represents the page
that you see whenever you load the page itself - the buttons, links, alignment,
images, and more. Documents consist of “nodes”, which represent these buttons,
links, alignment, images, etc - “elements” of the page.

Since our extension is going to replace “cloud” with “butt” in all the text on
the page, we should act accordingly:

**So what's the goal of this extension?** The goal of our plugin is to visit all
the nodes of the document, and when we encounter a text node, replace all
occurrences of "cloud" with "butt".

### So let’s do it!

**Challenge**: Stop here and try to do it on your own. Your way might be
different than the one used in this guide, but the goal here is to get it
working! No one solution is correct, and there might be more efficient ways than
others.

First, remember how I said that we have to add other websites? That's because
right now, we're only watching Google.com. We need to fix that. In our
`manifest.json` file, change:

```json

"matches": [
  "https://www.google.com/*"
],

```

to all sites:

```json

"matches": [
  "*://*/*"
],

```

In our `scripts/inject.js` file, we’re provided with a skeleton of a javascript
file that runs when the page has completed loading. We can use this to then
modify all the occurrences of `cloud` with `butt`.

Here's what our `inject.js` looks like. Yours might be different:

{% highlight js %}
chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);

        // Walk through all the nodes to get all text nodes.
        // Thanks to: http://stackoverflow.com/a/5904945
        // and also: http://stackoverflow.com/a/9452386
        var textNodes = [];
        (function walkNodeForText(node) {
            if (node) {
                node = node.firstChild;
                while (node != null) {
                    switch (node.nodeType) {
                        // Recurse into elements, documents, and document fragments
                        case 1:
                        case 9:
                        case 11:
                            walkNodeForText(node);
                            break;
                        // Add text nodes to the list of elements we want to modify
                        case 3:
                            textNodes.push(node);
                            break;
                    }

                    node = node.nextSibling;
                }
            }
        })(document.body);

        textNodes.forEach(function(currentVal, index, array) {
            // replace all case-insensitive occurences of 'cloud' with 'butt'.
            currentVal.nodeValue = currentVal.nodeValue.replace(/cloud/gi, "butt");
        });

    }
    }, 10);
});
{% endhighlight %}

Reload your extension, navigate to a page that has `cloud`, and _voila_! It's
done!

## Going Further
Now that you have a working extension, it's time to customise it to your
liking! These are all challenges that you can do, and we will leave it to you
to figure them out. Some of them are obvious, some of them aren't, but we have
faith that guys can do it!

**Challenge**: Modify the name, description, and author of your extension.

**Challenge**: Make a creative picture for your extension!

**Challenge**: Find different ways for your extension to run. How else can your
extension run?

**Challenge**: Make an options menu to enable and disable the extension.

**Challenge**: Expand the extension to add more word to word options.
