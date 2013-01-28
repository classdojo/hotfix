## Hotfix

Hotfix is a simple utility that pushes new fixes to the end client.


## How It Works

1. You call `hotfix 

## Requirements

- [Node.js](http://nodejs.org)
- [Pubnub](http://www.pubnub.com/) or [pusher](http://pusher.com/)

## Installation

Assuming you have node.js installed, call:

```bash
npm i hotfix -g
```

## Usage

There are a few ways yo use hotfix:

### Hotfix & express

1. First create a dead simple server:

```javascript
var express = require("express"),
hotfix = require("hotfix"),
server = express();
server.use(hotfix());
server.listen(8080);
```

2. Next, add this script tag to the header of your HTML document:

```html
<html>
  <head>
    <script src="/hotfix.js"></script>
  </head>
  <body>
    Hello World!
  </body>
</html>
```

3. Open a browser, and navigate to `http://localhost:8080`.
4. Make a change to your HTML doc, and call `hotfix push-update` in the command line to refresh all open pages.



