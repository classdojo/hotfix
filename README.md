## Hotfix

Hotfix is a simple utility that pushes new fixes to the end client while they're still on your site.

## Requirements

- [Node.js](http://nodejs.org)
- [Pubnub](http://www.pubnub.com/)

## Dev Dependencies

### Testing

- phantomjs - `brew install phantomjs`

### Building

- browserify - `npm i browserify -g`
- closure-compiler - `brew install closure-compiler`
- coffee-script - `npm i coffee-script -g`


## Installation

Assuming you have node.js installed, call:

```bash
npm i hotfix -g
```

## Usage

There are a few ways to use hotfix:

### Hotfix & Express

1. First create a simple server:

```javascript
var express = require("express"),
hotfix = require("hotfix"),
server = express();
hotfix.server(server);
server.listen(8080);
```

2. Next, add this script tag to the header of your HTML document:

```html
<html>
  <head>
    <script src="/hotfix/main.bundle.js"></script>
  </head>
  <body>
    Hello World!
  </body>
</html>
```

3. Open a browser, and navigate to `http://localhost:8080`.
4. Make a change to your HTML doc, and call `hotfix push-changes` in the command line to refresh all open pages.


### Hotfix & the command line

You can also use hotfix without node.js. To get started, run:

```bash
hotfix run-server --port=8080
```

### Tips

Running a critical update that forces the user to refresh

```bash
hotfix push-changes --critical
```

Running an update against only certain clients (assuming you have something like `window.app.version` assigned). Note that all mongodb-like queries are accepted since the hotfix client uses [sift](/crcn/sift.js).

```bash
hotfix push-changes --filter="{\"app.version\": 19 }"
```

Customizing the end-user message

```bash
hotfix push-changes --message="This page is about to refresh due to connectivity issues"
```

### CLI Usage

```
Usage: [command] --arg=value --arg2

Help:
  help                        Show help menu
  [cmd] help                  Show command help menu

Options:
  run-server                  Runs the hotfix http server
  push-changes                Pushes changes to all clients that are currently viewing the site
```

#### run-server command

```
Runs the hotfix http server

Usage: run-server

Optional Flags:
  --port=8080                 The http port to run hotfix on
```

#### push-changes command

```
Pushes changes to all clients that are currently viewing the site

Usage: push-changes

Optional Flags:
  --filter                    mongodb-style filter for each client
  --message=New updates a...  Message to display to the client.
  --critical                  Critical update - user account is force refreshed.
  --config=/usr/local/etc...  Configuration file for pubnub.
```



