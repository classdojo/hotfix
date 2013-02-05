(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/node_modules/sift/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./sift.js"}
});

require.define("/node_modules/sift/sift.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * Sift
 * 
 * Copryright 2011, Craig Condon
 * Licensed under MIT
 *
 * Inspired by mongodb's query language 
 */


(function() {


	/**
	 */

	var _convertDotToSubObject = function(keyParts, value) {

		var subObject = {},
		currentValue = subObject;

		for(var i = 0, n = keyParts.length - 1; i < n; i++) {
			currentValue = currentValue[keyParts[i]] = {};
		}

		currentValue[keyParts[i]] = value;
		
		return subObject;
	}

	/**
	 */

	var _queryParser = new (function() {

		/**
		 * tests against data
		 */

		var priority = this.priority = function(statement, data) {

			var exprs = statement.exprs,
			priority = 0;

			//generally, expressions are ordered from least efficient, to most efficient.
			for(var i = 0, n = exprs.length; i < n; i++) {

				var expr = exprs[i],
				p;

				if(!~(p = expr.e(expr.v, _comparable(data), data))) return -1;

				priority += p;

			}


			return priority;
		}


		/**
		 * parses a statement into something evaluable
		 */

		var parse = this.parse = function(statement, key) {

			//fixes sift(null, []) issue
			if(!statement) statement = { $eq: statement };

			var testers = [];
				
			//if the statement is an object, then we're looking at something like: { key: match }
			if(statement.constructor == Object) {

				for(var k in statement) {

					//find the apropriate operator. If one doesn't exist, then it's a property, which means
					//we create a new statement (traversing) 
					var operator = !!_testers[k] ?  k : '$trav',

					//value of given statement (the match)
					value = statement[k],

					//default = match
					exprValue = value;

					//if we're working with a traversable operator, then set the expr value
					if(TRAV_OP[operator]) {


						//using dot notation? convert into a sub-object
						if(~k.indexOf(".")) {
							var keyParts = k.split(".");
							k = keyParts.shift(); //we're using the first key, so remove it

							exprValue = value = _convertDotToSubObject(keyParts, value);
						}
						
						//*if* the value is an array, then we're dealing with something like: $or, $and
						if(value instanceof Array) {
							
							exprValue = [];

							for(var i = value.length; i--;) {
								exprValue.push(parse(value[i]));		
							}

						//otherwise we're dealing with $trav
						} else {	
							exprValue = parse(value, k);
						}
					} 
					

					testers.push(_getExpr(operator, k, exprValue));

				}
								

			//otherwise we're comparing a particular value, so set to eq
			} else {
				testers.push(_getExpr('$eq', k, statement));
			}

			var stmt =  { 
				exprs: testers,
				k: key,
				test: function(value) {
					return !!~stmt.priority(value);
				},
				priority: function(value) {
					return priority(stmt, value);
				}
			};
			
			return stmt;
		
		}


		//traversable statements
		var TRAV_OP = {
			$and: true,
			$or: true,
			$nor: true,
			$trav: true,
			$not: true
		};


		function _comparable(value) {
			if(value instanceof Date) {
				return value.getTime();
			} else {
				return value;
			}
		}

		function btop(value) {
			return value ? 0 : -1;
		}

		var _testers = {

			/**
			 */

			$eq: function(a, b) {
				return btop(a.test(b));
			},

			/**
			 */

			$ne: function(a, b) {
				return btop(!a.test(b));
			},

			/**
			 */

			$lt: function(a, b) {
				return btop(a > b);
			},

			/**
			 */

			$gt: function(a, b) {
				return btop(a < b);
			},

			/**
			 */

			$lte: function(a, b) {
				return btop(a >= b);
			},

			/**
			 */

			$gte: function(a, b) {
				return btop(a <= b);
			},


			/**
			 */

			$exists: function(a, b) {
				return btop(a == !!b);
			},

			/**
			 */

			$in: function(a, b) {

				//intersecting an array
				if(b instanceof Array) {

					for(var i = b.length; i--;) {
						if(~a.indexOf(b[i])) return i;
					}	

				} else {
					return btop(~a.indexOf(b));
				}


				return -1;
			},

			/**
			 */

			$not: function(a, b) {
				return btop(!a.test(b));
			},

			/**
			 */

			$type: function(a, b, org) {

				//instanceof doesn't work for strings / boolean. instanceof works with inheritance
				return org ? btop(org instanceof a || org.constructor == a) : -1;
			},

			/**
			 */


			$nin: function(a, b) {
				return ~_testers.$in(a, b) ? -1 : 0;
			},

			/**
			 */

			$mod: function(a, b) {
				return b % a[0] == a[1] ? 0 : -1;
			},

			/**
			 */

			$all: function(a, b) {

				for(var i = a.length; i--;) {
					if(b.indexOf(a[i]) == -1) return i;
				}

				return -1;
			},

			/**
			 */

			$size: function(a, b) {
				return b ? btop(a == b.length) : -1;
			},

			/**
			 */

			$or: function(a, b) {

				var i = a.length, p, n = i;

				for(; i--;) {
					if(~priority(a[i], b)) {
						return i;
					}
				}

				return btop(n == 0);
			},

			/**
			 */

			$nor: function(a, b) {

				var i = a.length, n = i;

				for(; i--;) {
					if(~priority(a[i], b)) {
						return -1;
					}
				}

				return 0;
			},

			/**
			 */

			$and: function(a, b) {

				for(var i = a.length; i--;) {
					if(!~priority(a[i], b)) {
						return -1;
					}
				}

				return 0;
			},

			/**
			 */

			$trav: function(a, b) {

				if(b instanceof Array) {
					
					for(var i = b.length; i--;) {
						var subb = b[i];
						if(subb[a.k] && ~priority(a, subb[a.k])) return i;
					}

					return -1;
				}

				return b ? priority(a, b[a.k]) : -1;
			}
		}

		var _prepare = {
			
			/**
			 */

			$eq: function(a) {
				
				var fn;

				if(a instanceof RegExp) {
					return a;
				} else if (a instanceof Function) {
					fn = a;
				} else {
					
					fn = function(b) {	
						if(b instanceof Array) {		
							return ~b.indexOf(a);
						} else {
							return a == b;
						}
					}
				}

				return {
					test: fn
				}

			},
			
			/**
			 */
				
			 $ne: function(a) {
				return _prepare.$eq(a);
			 }
		};



		var _getExpr = function(type, key, value) {

			var v = _comparable(value);

			return { 

				//k key
				k: key, 

				//v value
				v: _prepare[type] ? _prepare[type](v) : v, 

				//e eval
				e: _testers[type] 
			};

		}


	})();


	var getSelector = function(selector) {

		if(!selector) {

			return function(value) {
				return value;
			};

		} else 
		if(typeof selector == 'function') {
			return selector;
		}

		throw new Error("Unknown sift selector " + selector);
	}

	var sifter = function(query, selector) {

		//build the filter for the sifter
		var filter = _queryParser.parse( query );
			
		//the function used to sift through the given array
		var self = function(target) {
				
			var sifted = [], results = [], value, priority;

			//I'll typically start from the end, but in this case we need to keep the order
			//of the array the same.
			for(var i = 0, n = target.length; i < n; i++) {

				value = selector(target[i]);

				//priority = -1? it's not something we can use.
				if(!~(priority = filter.priority( value ))) continue;

				//push all the sifted values to be sorted later. This is important particularly for statements
				//such as $or
				sifted.push({
					value: value,
					priority: priority
				});
			}

			//sort the values
			sifted.sort(function(a, b) {
				return a.priority > b.priority ? -1 : 1;
			});

			var values = Array(sifted.length);

			//finally, fetch the values & return them.
			for(var i = sifted.length; i--;) {
				values[i] = sifted[i].value;
			}

			return values;
		}

		//set the test function incase the sifter isn't needed
		self.test   = filter.test;
		self.score = filter.priority;
		self.query  = query;

		return self;
	}


	/**
	 * sifts the given function
	 * @param query the mongodb query
	 * @param target the target array
	 * @param rawSelector the selector for plucking data from the given target
	 */

	var sift = function(query, target, rawSelector) {

		//must be an array
		if(typeof target != "object") {
			rawSelector = target;
			target = undefined;
		}


		var sft  = sifter(query, getSelector(rawSelector));

		//target given? sift through it and return the filtered result
		if(target) return sft(target);

		//otherwise return the sifter func
		return sft;

	}


	//node.js?
	if((typeof module != 'undefined') && (typeof module.exports != 'undefined')) {
		
		module.exports = sift;

	} else 

	//browser?
	if(typeof window != 'undefined') {
		
		window.sift = sift;

	}

})();


});

require.define("/lib/client/template.js",function(require,module,exports,__dirname,__filename,process,global){// Generated by CoffeeScript 1.4.0
(function() {

  module.exports = '\
  <div class="hotfix-notification">\
    <div class="hotfix-message"></div> \
    <div class="hotfix-buttons">\
      <a class="hotfix-ignore-button">ignore</a> \
      <a class="hotfix-refresh-button">refresh</a>\
    </div>\
  </div>\
';

}).call(this);

});

require.define("/lib/client/main.js",function(require,module,exports,__dirname,__filename,process,global){// Generated by CoffeeScript 1.4.0
(function() {
  var MESSAGE_DISPLAY_TIME, MIN_PAGE_REFRESH_INTERVAL, getDateNow, hotfix, lastUpdated, refreshPage, refreshTimeout, showMessage, sift, template;

  sift = require("sift");

  template = require("./template");

  hotfix = window.hotfix = {};

  MESSAGE_DISPLAY_TIME = 1000 * 3;

  MIN_PAGE_REFRESH_INTERVAL = typeof window.callPhantom !== "undefined" || window.debugHotfix ? 1000 : 1000 * 30;

  refreshTimeout = null;

  getDateNow = function() {
    if (!Date.now) {
      return new Date().valueOf();
    }
    return Date.now();
  };

  lastUpdated = Number(getDateNow());

  $(document).ready(function() {
    var $hfx, checkForUpdates, host;
    $hfx = $("#hotfix");
    host = $hfx.attr("data-host") || $hfx.attr("host") || "";
    checkForUpdates = function() {
      return $.ajax({
        type: "GET",
        url: ("" + host + "/hotfix/info.json?r=") + getDateNow(),
        dataType: "json",
        jsonp: true,
        success: function(resp) {
          var result;
          result = resp.result;
          if (result.updatedAt > lastUpdated) {
            lastUpdated = result.updatedAt;
            return refreshPage(result);
          }
        },
        error: function(err) {}
      });
    };
    setInterval(checkForUpdates, MIN_PAGE_REFRESH_INTERVAL);
    return checkForUpdates();
  });

  /*
   refreshes the page
  */


  refreshPage = function(payload) {
    var msg, reloadPage;
    if (hotfix.onDisplayMessage) {
      hotfix.onDisplayMessage(payload);
    }
    if (payload.filter) {
      if (sift(payload.filter, [window]).length === 0) {
        return;
      }
    }
    msg = showMessage(payload);
    reloadPage = function() {
      if (hotfix.onReloadPage) {
        hotfix.onReloadPage(payload);
      }
      return location.reload();
    };
    if (payload.critical) {
      return setTimeout(reloadPage, MESSAGE_DISPLAY_TIME);
    } else {
      msg.find(".hotfix-refresh-button").click(reloadPage);
      return msg.find(".hotfix-ignore-button").click(function() {
        return msg.animate({
          top: "-100px"
        });
      });
    }
  };

  /*
  */


  showMessage = function(data) {
    var msg;
    msg = $(template);
    msg.css({
      top: "-100px"
    });
    msg.find(".hotfix-message").text(data.message);
    if (data.critical) {
      msg.find(".hotfix-buttons").css({
        "display": "none"
      });
    }
    $(document.body).append(msg);
    msg.animate({
      top: "0px"
    });
    return msg;
  };

}).call(this);

});
require("/lib/client/main.js");
})();
