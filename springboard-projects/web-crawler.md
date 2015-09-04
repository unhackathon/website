---
layout: springboard
title: Write You a Web Crawler
---
# Write You a Web Crawler

## Introduction

This springboard project will have you build a simple web crawler in Python using the Requests library. Once you have implemented a basic web crawler and understand how it works, you will have numerous opportunities to expand your crawler to solve interesting problems.

If you're feeling adventurous or dislike Python, you may decide to implement your web crawler using different technologies. We've suggested some additional resources for this in an appendix.

## Tutorial

### Assumptions

This tutorial assumes that you have Python 3 installed on your machine. If you do not have Python installed (or you have an earlier version installed) you can find the latest Python builds at [https://www.python.org/downloads/](https://wwww.python.org/downloads/). Make sure you have the correct version in your environment variables.

We will use pip to install packages. Make sure you have that installed as well. Sometimes this is installed as pip3 to differentiate between versions of pip built with Python 2 or Python 3; if this is the case, be mindful to use the pip3 command instead of pip while following along in the tutorial.

We also assume that you’ll be working from the command line. You may use an IDE if you choose, but some aspects of this guide will not apply.

This guide assumes only basic programming ability and knowledge of data structures and Python. If you’re more advanced, feel free to use it as a reference rather than a step by step tutorial. If you haven’t used Python and can’t follow along, check out the official Python tutorial at [https://docs.python.org/3/tutorial/](https://docs.python.org/3/tutorial/) and/or Codecademy’s Python class at [https://www.codecademy.com/tracks/python](https://www.codecademy.com/tracks/python).

### Setting up your project

Let’s get the basic setup out of the way now. (Next we’ll give a general overview of the project, and then we’ll jump into writing some code.)

Type the following in terminal:

{% highlight bash %}
mkdir webcrawler
cd webcrawler

pip3 install virtualenv
virtualenv venv
source venv/bin/activate

pip3 install requests
{% endhighlight %}

You’ve just made a directory to hold your project, set up a virtual environment in which your Python packages won’t interfere with those in your system environment, and we’ve installed Requests, the “HTTP for Humans” library for Python, which is the primary library we’ll be using to build our web crawler. If you’re confused by any of this you may want to ask a mentor to explain bash and/or package managers. You might also have issues due to system differences; let us know if you get stuck.

### Web crawler overview

Web crawlers are pretty simple. Starting from a certain URL (or a list of URLs), they will check the HTML at that URL for links (and other information) and then follow those links to repeat the process. A web crawler is the basis of many popular tools such as search engines (though search engines such as Google have much harder problems such as “How do we index this information so that it is searchable?”).

### Making our first HTTP request

Before we can continue, we need to know how to make an HTTP request using the Requests library and, also, how to manipulate the data we receive from the response to that request.

In a text editor, create a file `webcrawler.py` and we’ll now edit that file:

{% highlight python %}
import requests

r = requests.get('http://unhackathon.org/')
{% endhighlight %}

This code gives us access to the Requests library on line one and uses the `get` method from that library to create a `Response` object called `r`.

If we enter the same code in the Python interactive shell (type `python3` in the terminal to access the Python shell) we can examine `r` in more depth:

{% highlight python %}
>>> r
<Response [200]>
{% endhighlight %}

Entering the variable `r`, we get told that we have a response object with status code 200. (If you get a different error code, the Unhackathon website might be down.) 200 is the standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action. Our `requests.get` method in Python is making a HTTP GET request under the surface, so our response contains the home page of unhackathon.org and associated metadata.

{% highlight python %}
>>> dir(r)
['__attrs__', '__bool__', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__getstate__', '__gt__', '__hash__', '__init__', '__iter__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__nonzero__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__setstate__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_content', '_content_consumed', 'apparent_encoding', 'close', 'connection', 'content', 'cookies', 'elapsed', 'encoding', 'headers', 'history', 'is_permanent_redirect', 'is_redirect', 'iter_content', 'iter_lines', 'json', 'links', 'ok', 'raise_for_status', 'raw', 'reason', 'request', 'status_code', 'text', 'url']
{% endhighlight %} {:class='wrap-code'}

We can examine `r` in more detail with Python’s built-in function `dir` as above. From the list of properties above, it looks like `‘content’` might be of interest.

{% highlight python %}
>>> r.content
b'<!DOCTYPE html>\n<html>\n\n  <head>\n  <meta charset="utf-8">\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta property="og:site_name" content="Unhackathon"/>\n  <meta property="og:title" content="A New Kind of Hackathon, September 5-6, NYC" />\n  <meta property="og:url" content="http://unhackathon.org/" />\n  <meta property="og:image" content="http://unhackathon.org/hack-logo2.png" />\n  <meta property="og:description" content="Sign up for a new kind of hackathon focusing on learning and diversity of hackers and their hacks.\n">\n\n  <title>Unhackathon</title>\n… 
{% endhighlight %} {:class='wrap-code'}

Indeed, it is. Our `r.content` object contains the HTML from the Unhackathon home page. This will be helpful in the next section.

Before we go on though, perhaps you’d like to become acquainted with some of the other properties. Know what data is available might help you as you think of ways to expand this project after the tutorial is completed.
Finding URLs

Before we can follow new links, we must extract the URLs from the HTML of the page we’ve already requested. The regular expressions library in Python is useful for this.

{% highlight python %}
>>> import re
>>> links = re.findall('<a href="(.*?)">(.*?)</a>', str(r.content))
>>> links
[('/code-of-conduct/', 'Code of Conduct'), ('mailto:sponsorship@unhackathon.org', 'sponsorship@unhackathon.org'), ('/faq/', 'frequently asked questions'), ('mailto:team@unhackathon.org', 'team@unhackathon.org')]
{% endhighlight %} {:class='wrap-code'}

We pass the `re.findall` method our regular expression, capturing on the URL and the link text, though we only really need the former. It also gets passed the `r.content` object that we are searching in, which will need to be cast to a string. We are returned a list of tuples, containing the strings captured by the regular expression.

There are two main things to note here, the first being that some of our URLs are for other protocols than HTTP. It doesn’t make sense to access these with an HTTP request, and doing so will only result in an exception. So before we move on, you’ll want to eliminate the strings beginning with “mailto”, “ftp”, “file”, etc. Similarly, links pointing to `127.0.0.1` or `localhost` are of little use to us if we want our results to be publicly accessible.

The second thing to note is that some of our URLs are relative so we can’t use that as our argument to `requests.get`. We will need to take the relative URLs and append them to the URL of the page we are on when we find those relative URLs. For example, we found an `‘/faq/’` URL above. This will need to become `‘http://unhackathon.org/faq/’`. This is usually simple string concatenation, but be careful: a relative URL may indicate a parent directory using two dots and then things become more complicated.

### Following URLs

Assume we now have a list of full URLs. We’ll now recursively request the content at those URLs and extract new URLs from that content.

We’ll want to maintain a list of URLs we’ve already requested (this is mainly what we’re after at this point and it also helps prevents us from getting stuck in a non-terminating loop) and a list of valid URLs we’ve discovered but have yet to request.

{% highlight python %}
import requests
import re

def crawl_web(initial_url):
    crawled, to_crawl = [], []
    to_crawl.append(initial_url)

    while to_crawl:
        current_url = to_crawl.pop(0)
        r = requests.get(current_url)
        crawled.append(current_url)
        for url in re.findall('<a href="(.*?)">', str(r.content)):
            if url[0] == '/':
                url = current_url + url
            pattern = re.compile('https?')
            if pattern.match(url):
                to_crawl.append(url)
    return crawled

print(crawl_web('http://unhackathon.org'))
{% endhighlight %}

This code will probably have issues if we feed it a page for the initial URL that is part of a site that isn’t self-contained. (Say, for instance, that `unhackathon.org` links to `yahoo.com`; we’ll never reach the last page since we’ll always be adding new URLs to our `to_crawl` list.) We’ll discuss several strategies to deal with this issue in the next section.

### Strategies to prevent never ending processes

#### Counter

Perhaps we are satisfied once we have crawled n number of sites. Modify `crawl_web `to take a second argument (an integer n) and add logic before the loop so that we return our list once it’s length meets our requirements.

#### Timer

Perhaps we have an allotted time in which to run our program. Instead of passing in a maximum number of URLs we can pass in any number of seconds and revise our program to return the list of crawled URLs once that time has passed.

#### Generators

We can also use generators to receive results as they are discovered, instead of waiting for all of our code to run and return a list at the end. This doesn’t solve the issue of a long running process (though one could terminate the process by hand with Ctrl-C) but it is useful for seeing our script’s progress.

{% highlight python %}
import requests
import re

def crawl_web(initial_url):
    crawled, to_crawl = [], []
    to_crawl.append(initial_url)

    while to_crawl:
        current_url = to_crawl.pop(0)
        r = requests.get(current_url)
        crawled.append(current_url)
        for url in re.findall('<a href="([^"]+)">', str(r.content)):
            if url[0] == '/':
                url = current_url + url[1:]
            pattern = re.compile('https?')
            if pattern.match(url):
                to_crawl.append(url)
        yield current_url


crawl_web_generator = crawl_web('http://ctogden.com')
for result in crawl_web_generator:
    print(result)
{% endhighlight %}

Generators were introduced with PEP 255 ([https://www.python.org/dev/peps/pep-0255/](https://www.python.org/dev/peps/pep-0255)). You can find more about them by Googling for ‘python generators’ or ‘python yield’.

Perhaps you should combine the approach of using generators with another approach. Also, can you think of any other methods that may be of use?

### Robots.txt

Robots.txt is a standard for asking “robots” (web crawlers and similar tools) not to crawl certain sites or pages. While it’s easy to ignore these requests, it’s generally a nice thing to account for. Robots.txt files are found in the root directory of a site, so before you crawl `example.com/` it’s a simple matter to check `example.com/robots.txt` for any exclusions. To keep things simple you are looking for the following directives:

```
User-agent: *
Disallow: /
```

Pages may also allow/disallow certain pages instead of all pages. Check out [https://en.wikipedia.org/robots.txt](https://en.wikipedia.org/robots.txt) for an example.

### Further Exercises

1. Modify your program to follow `robots.txt` rules if found.
Right now, our regular expression will not capture links that are more complicated than `<a href=”http://example.com”>` or `<a href=”/faq/”>`. For example, ``<a class=”fancy-link” href=”http://example.com”>` will fail because we do not allow for anything but a space between `a` and `href`. Modify the regular expression to make sure we’re following all the links. Check out [https://regex101.com/](https://regex101.com/) if you’re having trouble.
2. Our program involves a graph traversal. Right now our algorithm resembles bread-first search. What simple change can we make to get depth-first search?
3. In addition to each page’s URL, also print its title and the number of child links, in CSV format.
4. Instead of CSV format, print results in JSON. Can you print a single JSON document while using generators? You can validate your JSON at [http://pro.jsonlint.com/](http://pro.jsonlint.com/).
5. There are some bugs in our code above. Can you find them and fix them?

### Conclusion

This concludes the tutorial. We hope it illustrated the basic concepts at work in building a web crawler. Perhaps now is a good time to step back and review your code. You might want to do some refactoring, or even write some tests to help prevent you from breaking what you have working now as you modify it to expand its functionality.

As you consider where to go next, remember we’re available to answer any questions you might have. Cheers!

## What Next?

This tutorial above was just intended to get you started. Now that you’ve completed it, there are many options for branching off and creating something of your own. Here are some ideas:

* Import your JSON into a RethinkDB database and then create an app that queries against that database. Or analyze the data with a number of queries and visualize the results.
* Analyze HTTP header fields. For example, one could compile statistics on different languages used on the backend using the X-Powered-By field.
* Implement the functionality of Scrapy using a lower level library, such as Requests.
* Set up your web crawler to repeatedly crawl a site at a set intervals to check for new pages or changes to content. List the URLs of changed/added/deleted pages or perhaps even a diff of the changes. This could be part of a tool to detect malicious changes on hacked websites or to hold news sites accountable for unannounced edits or retractions.
* Use your crawler to monitor a site or forum for mentions of your name or internet handle. Trigger an email or text notification whenever someone uses your name.
* Maintain a graph of the links you crawl and visualize the connectedness of certain websites.
* Scrape photos of animals from animal shelter websites and create a site displaying their information.
* Create a price comparison website. Scrape product names and prices from different online retailers.
* Create a tool to map public connections between people (Twitter follows, blogrolls, etc.) for job recruiting, marketing, or sales purposes.
* Look for certain words or phrases across the web to answer questions such as “Which house in Harry Potter is mentioned the most?”, “How often are hashtags used outside of social media?”
* Starting from a list of startups, crawl their sites for pages mentioning “job”/”careers”/”hiring” and from those scrape job listings. Use these to create a job board.

Or perhaps you have an idea of your own. If so, we look forward to hearing about it!

## Additional Resources

* [Scrapy](http://scrapy.org/) is a scraping library for Python. It is higher level than Requests.
* [Request](https://www.npmjs.com/package/request) is a "Simplified HTTP request client" for Node.js. It might be useful if you’d rather use JavaScript/Node than Python.
