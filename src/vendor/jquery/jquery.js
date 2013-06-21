/*!
 * jQLite JavaScript Library v1.1.1 (http://code.google.com/p/jqlite/)
 *
 * Copyright (c) 2010 Brett Fattori (bfattori@gmail.com)
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Many thanks to the jQuery team's efforts.  Some code is
 * Copyright (c) 2010, John Resig.  See
 * http://jquery.org/license
 *
 * @author Brett Fattori (bfattori@gmail.com)
 * @author $Author: bfattori $
 * @version $Revision: 144 $
 *
 * Created: 03/29/2010
 * Modified: $Date: 2010-06-21 11:06:36 -0400 (Mon, 21 Jun 2010) $
 */

function now(){
  return +new Date;
}

/*
  Simplified DOM selection engine
  START ---------------------------------------------------------
*/
var parseChunks = function(stringSelector, contextNodes) {

  if (stringSelector === "" && contextNodes) {
     return contextNodes;
  }

  var chunks = stringSelector.split(" ");

  // Revise the context nodes
  var chunk = chunks.shift();
  var ctxNode;

  // Is the chunk an Id selector?
  if (chunk.charAt(0) == "#") {
     var idNode = document.getElementById(chunk.substring(1));
     ctxNode = idNode ? [idNode] : [];
  } else {

     var elName = chunk.charAt(0) !== "." ? chunk.split(".")[0] : "*";
     var classes = chunk.split(".");
     var attrs = null;

     // Remove any attributes from the element
     if (elName.indexOf("[") != -1) {
        attrs = elName;
        elName = elName.substr(0, elName.indexOf("["));
     }

     var cFn = function(node) {
        var aC = arguments.callee;
        if ((!aC.needClass || hasClasses(node, aC.classes)) &&
            (!aC.needAttribute || hasAttributes(node, aC.attributes))) {
           return node;
        }
     };

     // Find tags in the context of the element
     var cnodes = [];
     for (var cxn = 0; cxn < contextNodes.length; cxn++) {
        var x = contextNodes[cxn].getElementsByTagName(elName);
        for (var a = 0;a < x.length; a++) {
           cnodes.push(x[a]);
        }
     }
     if (classes) {
        classes.shift();
     }
     ctxNode = [];
     cFn.classes = classes;

     if (attrs != null) {
        var b1 = attrs.indexOf("[");
        var b2 = attrs.lastIndexOf("]");
        var as = attrs.substring(b1 + 1,b2);
        var attrib = as.split("][");
     }

     cFn.attributes = attrs != null ? attrib : null;
     cFn.needClass = (chunk.indexOf(".") != -1 && classes.length > 0);
     cFn.needAttribute = (attrs != null);

     for (var j = 0; j < cnodes.length; j++) {
        if (cFn(cnodes[j])) {
           ctxNode.push(cnodes[j]);
        }
     }
  }

  return parseChunks(chunks.join(" "), ctxNode);
};

var parseSelector = function(selector, context) {

  context = context || document;

  if (selector.nodeType && selector.nodeType === DOM_DOCUMENT_NODE) {
     selector = document.body;
     if (selector === null) {
        // Body not ready yet, return the document instead
        return [document];
     }
  }

  if (selector.nodeType && selector.nodeType === DOM_ELEMENT_NODE) {
     // Is the selector already a single DOM node?
     return [selector];
  }

  if (selector.jquery && typeof selector.jquery === "string") {
     // Is the selector a jQL object?
     return selector.toArray();
  }

  if (context) {
     context = cleanUp(context);
  }

  if (jQL.isArray(selector)) {
     // This is already an array of nodes
     return selector;
  } else if (typeof selector === "string") {

     // This is the meat and potatoes
     var nodes = [];
     for (var cN = 0; cN < context.length; cN++) {
        // For each context node, look for the
        // specified node within it
        var ctxNode = [context[cN]];
        if (!jQL.forceSimpleSelectorEngine && ctxNode[0].querySelectorAll) {
           var nl = ctxNode[0].querySelectorAll(selector);
           for (var tni = 0; tni < nl.length; tni++) {
              nodes.push(nl.item(tni));
           }
        } else {
           nodes = nodes.concat(parseChunks(selector, ctxNode));
        }
     }
     return nodes;
  } else {
     // What do you want me to do with this?
     return null;
  }
};

var hasClasses = function(node, cArr) {
  if (node.className.length == 0) {
     return false;
  }
  var cn = node.className.split(" ");
  var cC = cArr.length;
  for (var c = 0; c < cArr.length; c++) {
     if (jQL.inArray(cArr[c], cn) != -1) {
        cC--;
     }
  }
  return (cC == 0);
};

var hasAttributes = function(node, attrs) {
  var satisfied = true;
  for (var i = 0; i < attrs.length; i++) {
     var tst = attrs[i].split("=");
     var op = (tst[0].indexOf("!") != -1 || tst[0].indexOf("*") != -1) ? tst[0].charAt(tst[0].length - 1) + "=" : "=";
     if (op != "=") {
        tst[0] = tst[0].substring(0, tst[0].length - 1);
     }
     switch (op) {
        case "=": satisfied &= (node.getAttribute(tst[0]) === tst[1]); break;
        case "!=": satisfied &= (node.getAttribute(tst[0]) !== tst[1]); break;
        case "*=": satisfied &= (node.getAttribute(tst[0]).indexOf(tst[1]) != -1); break;
        default: satisfied = false;
     }
  }
  return satisfied;
};

/*
  END -----------------------------------------------------------
  Simplified DOM selection engine
*/

var gSupportScriptEval = false;

setTimeout(function() {
  var root = document.body;

  if (!root) {
     setTimeout(arguments.callee, 33);
     return;
  }

  var script = document.createElement("script"),
   id = "i" + new Date().getTime();

  script.type = "text/javascript";
  try {
     script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
  } catch(e) {}

  root.insertBefore( script, root.firstChild );

  // Make sure that the execution of code works by injecting a script
  // tag with appendChild/createTextNode
  // (IE doesn't support this, fails, and uses .text instead)
  var does = true;
  if ( window[ id ] ) {
     delete window[ id ];
  } else {
     does = false;
  }

  root.removeChild( script );
  gSupportScriptEval = does;
}, 33);

var stripScripts = function(data) {
  // Wrap the data in a dom element
  var div = document.createElement("div");
  div.innerHTML = data;
  // Strip out all scripts
  var scripts = div.getElementsByTagName("script");

  return { scripts: scripts, data: data};
};

var properCase = function(str, skipFirst) {
  skipFirst = skipFirst || false;
  str = (!str ? "" : str.toString().replace(/^\s*|\s*$/g,""));

  var returnString = "";
  if(str.length <= 0){
     return "";
  }

  var ucaseNextFlag = false;

  if(!skipFirst) {
     returnString += str.charAt(0).toUpperCase();
  } else {
     returnString += str.charAt(0);
  }

  for(var counter=1;counter < str.length;counter++) {
     if(ucaseNextFlag) {
        returnString += str.charAt(counter).toUpperCase();
     } else {
        returnString += str.charAt(counter).toLowerCase();
     }
     var character = str.charCodeAt(counter);
     ucaseNextFlag = character == 32 || character == 45 || character == 46;
     if(character == 99 || character == 67) {
        if(str.charCodeAt(counter-1)==77 || str.charCodeAt(counter-1)==109) {
           ucaseNextFlag = true;
        }
     }
  }
  return returnString;
};


var fixStyleProp = function(name) {
  var tempName = name.replace(/-/g, " ");
  tempName = properCase(tempName, true);
  return tempName.replace(/ /g, "");
};

//------------------ EVENTS

/**
* Associative array of events and their types
* @private
*/
var EVENT_TYPES = {click:"MouseEvents",dblclick:"MouseEvents",mousedown:"MouseEvents",mouseup:"MouseEvents",
                  mouseover:"MouseEvents",mousemove:"MouseEvents",mouseout:"MouseEvents",contextmenu:"MouseEvents",
                  keypress:"KeyEvents",keydown:"KeyEvents",keyup:"KeyEvents",load:"HTMLEvents",unload:"HTMLEvents",
                  abort:"HTMLEvents",error:"HTMLEvents",resize:"HTMLEvents",scroll:"HTMLEvents",select:"HTMLEvents",
                  change:"HTMLEvents",submit:"HTMLEvents",reset:"HTMLEvents",focus:"HTMLEvents",blur:"HTMLEvents",
                  touchstart:"MouseEvents",touchend:"MouseEvents",touchmove:"MouseEvents"};

var createEvent = function(eventType) {
  if (typeof eventType === "string") {
     eventType = eventType.toLowerCase();
  }

  var evt = null;
  var eventClass = EVENT_TYPES[eventType] || "Event";
  if(document.createEvent) {
     evt = document.createEvent(eventClass);
     evt._eventClass = eventClass;
     if(eventType) {
        evt.initEvent(eventType, true, true);
     }
  }

  if(document.createEventObject) {
     evt = document.createEventObject();
     if(eventType) {
        evt.type = eventType;
        evt._eventClass = eventClass;
     }
  }

  return evt;
};

var fireEvent = function(node, eventType, data) {
  var evt = createEvent(eventType);
  if (evt._eventClass !== "Event") {
     evt.data = data;
     return node.dispatchEvent(evt);
  } else {
     var eHandlers = node._handlers || {};
     var handlers = eHandlers[eventType];
     if (handlers) {
        for (var h = 0; h < handlers.length; h++) {
           var args = jQL.isArray(data) ? data : [];
           args.unshift(evt);
           var op = handlers[h].apply(node, args);
           op = (typeof op == "undefined" ? true : op);
           if (!op) {
              break;
           }
        }
     }
  }
};

var setHandler = function(node, eventType, fn) {
  if (!jQL.isFunction(fn)) {
     return;
  }

  if (typeof eventType === "string") {
     eventType = eventType.toLowerCase();
  }

  var eventClass = EVENT_TYPES[eventType];
  if (eventType.indexOf("on") == 0) {
     eventType = eventType.substring(2);
  }
  if (eventClass) {
     // Let the browser handle it
     var handler = function(evt) {
        var aC = arguments.callee;
        var args = evt.data || [];
        args.unshift(evt);
        var op = aC.fn.apply(node, args);
        if (typeof op != "undefined" && op === false) {
           if (evt.preventDefault && evt.stopPropagation) {
              evt.preventDefault();
              evt.stopPropagation();
           } else {
              evt.returnValue = false;
              evt.cancelBubble = true;
           }
           return false;
        }
        return true;
     };
     handler.fn = fn;
     if (node.addEventListener) {
        node.addEventListener(eventType, handler, false);
     } else {
        node.attachEvent("on" + eventType, handler);
     }
  } else {
     if (!node._handlers) {
        node._handlers = {};
     }
     var handlers = node._handlers[eventType] || [];
     handlers.push(fn);
     node._handlers[eventType] = handlers;
  }
};

/**
* jQuery "lite"
*
* This is a small subset of support for jQuery-like functionality.  It
* is not intended to be a full replacement, but it will provide some
* of the functionality which jQuery provides to allow development
* using jQuery-like syntax.
*/
var jQL = function(s, e) {
  return new jQLp().init(s, e);
},
document = window.document,
hasOwnProperty = Object.prototype.hasOwnProperty,
toString = Object.prototype.toString,
push = Array.prototype.push,
slice = Array.prototype.slice,
DOM_ELEMENT_NODE = 1,
DOM_DOCUMENT_NODE = 9,
readyStack = [],
isReady = false,
setReady = false,
DOMContentLoaded;

/** 
* Force the usage of the simplified selector engine. Setting this to true will
* cause the simplified selector engine to be used, limiting the number of available
* selectors based on the original (jQLite v1.0.0 - v1.1.0) selector engine.  Keeping
* the value at "false" will allow jQLite to switch to using [element].querySelectorAll()
* if it is available.  This provides a speed increase, but it may function differently
* based on each platform.
*/
jQL.forceSimpleSelectorEngine = false;

jQL.find = Sizzle;

/**
* Loop over each object, performing the function for each one
* @param obj
* @param fn
*/
jQL.each = function(obj, fn) {
  var name, i = 0,
     length = obj.length,
     isObj = length === undefined || jQL.isFunction(obj);

  if ( isObj ) {
     for ( name in obj ) {
        if ( fn.call( obj[ name ], name, obj[ name ] ) === false ) {
           break;
        }
     }
  } else {
     for ( var value = obj[0];
        i < length && fn.call( value, i, value ) !== false; value = obj[++i] ) {}
  }

  return obj;
};

/**
* NoOp function (empty)
*/
jQL.noop = function() {};

/**
* Test if the given object is a function
* @param obj
*/
jQL.isFunction = function(obj) {
  return toString.call(obj) === "[object Function]";
};

/**
* Test if the given object is an Array
* @param obj
*/
jQL.isArray = function( obj ) {
  return toString.call(obj) === "[object Array]";
};

/**
* Test if the given object is an Object
* @param obj
*/
jQL.isPlainObject = function( obj ) {
  // Make sure that DOM nodes and window objects don't pass through, as well
  if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
     return false;
  }

  // Not own constructor property must be Object
  if ( obj.constructor && !hasOwnProperty.call(obj, "constructor")
     && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
     return false;
  }

  // Own properties are enumerated firstly
  var key;
  for ( key in obj ) {}
  return key === undefined || hasOwnProperty.call( obj, key );
};

/**
* Merge two objects into one
* @param first
* @param second
*/
jQL.merge = function( first, second ) {
  var i = first.length, j = 0;

  if ( typeof second.length === "number" ) {
     for ( var l = second.length; j < l; j++ ) {
        first[ i++ ] = second[ j ];
     }
  } else {
     while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
     }
  }

  first.length = i;

  return first;
};

jQL.param = function(params) {
  var pList = "";
  if (params) {
     jQL.each(params, function(val, name) {
        pList += (pList.length != 0 ? "&" : "") + name + "=" + encodeURIComponent(val);
     });
  }
  return pList;
};

jQL.evalScripts = function(scripts) {
  var head = document.getElementsByTagName("head")[0] || document.documentElement;
  for (var s = 0; s < scripts.length; s++) {

     var script = document.createElement("script");
     script.type = "text/javascript";

     if ( gSupportScriptEval ) {
        script.appendChild( document.createTextNode( scripts[s].text ) );
     } else {
        script.text = scripts[s].text;
     }

     // Use insertBefore instead of appendChild to circumvent an IE6 bug.
     // This arises when a base node is used (#2709).
     head.insertBefore( script, head.firstChild );
     head.removeChild( script );
  }
};

jQL.ready = function() {
  isReady = true;
  while(readyStack.length > 0) {
     var fn = readyStack.shift();
     fn();
  }
};

var expando = "jQuery" + now(), uuid = 0, windowData = {};

// The following elements throw uncatchable exceptions if you
// attempt to add expando properties to them.
jQL.noData = {
  "embed": true,
  "object": true,
  "applet": true
};

jQL.cache = {};

jQL.data = function( elem, name, data ) {
  if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
     return;
  }

  elem = elem == window ?
     windowData :
     elem;

  var id = elem[ expando ];

  // Compute a unique ID for the element
  if ( !id ) { id = elem[ expando ] = ++uuid; }

  // Only generate the data cache if we're
  // trying to access or manipulate it
  if ( name && !jQuery.cache[ id ] ) {
     jQuery.cache[ id ] = {};
  }

  // Prevent overriding the named cache with undefined values
  if ( data !== undefined ) {
     jQuery.cache[ id ][ name ] = data;
  }

  // Return the named cache data, or the ID for the element
  return name ?
     jQuery.cache[ id ][ name ] :
     id;
};

jQL.removeData = function( elem, name ) {
  elem = elem == window ?
     windowData :
     elem;

  var id = elem[ expando ];

  // If we want to remove a specific section of the element's data
  if ( name ) {
     if ( jQuery.cache[ id ] ) {
        // Remove the section of cache data
        delete jQuery.cache[ id ][ name ];

        // If we've removed all the data, remove the element's cache
        name = "";

        for ( name in jQuery.cache[ id ] )
           break;

        if ( !name ) {
           jQuery.removeData( elem );
        }
     }

  // Otherwise, we want to remove all of the element's data
  } else {
     // Clean up the element expando
     try {
        delete elem[ expando ];
     } catch(e){
        // IE has trouble directly removing the expando
        // but it's ok with using removeAttribute
        if ( elem.removeAttribute ) {
           elem.removeAttribute( expando );
        }
     }

     // Completely remove the data cache
     delete jQuery.cache[ id ];
  }
};

jQL.ajax = {
  status: -1,
  statusText: "",
  responseText: null,
  responseXML: null,

  send: function(url, params, sendFn) {
     if (jQL.isFunction(params)) {
        sendFn = params;
        params = {};
     }

     if (!url) {
        return;
     }

     var async = true, uName = null, pWord = null;
     if (typeof params.async !== "undefined") {
        async = params.async;
        delete params.async;
     }

     if (typeof params.username !== "undefined") {
        uName = params.username;
        delete params.username;
     }

     if (typeof params.password !== "undefined") {
        pWord = params.password;
        delete params.password;
     }

     // Poll for readyState == 4
     var p = jQL.param(params);
     if (p.length != 0) {
        url += (url.indexOf("?") == -1 ? "?" : "&") + p;
     }
     var req = new XMLHttpRequest();
     req.open("GET", url, async, uName, pWord);
     req.send();

     if (async) {
        var xCB = function(xhr) {
           var aC = arguments.callee;
           if (xhr.status == 200) {
              jQL.ajax.complete(xhr, aC.cb);
           } else {
              jQL.ajax.error(xhr, aC.cb);
           }
        };
        xCB.cb = sendFn;

        var poll = function() {
           var aC = arguments.callee;
           if (aC.req.readyState != 4) {
              setTimeout(aC, 250);
           } else {
              aC.xcb(aC.req);
           }
        };
        poll.req = req;
        poll.xcb = xCB;

        setTimeout(poll, 250);
     } else {
        // synchronous support?
     }
  },

  complete: function(xhr, callback) {
     jQL.ajax.status = xhr.status;
     jQL.ajax.responseText = xhr.responseText;
     jQL.ajax.responseXML = xhr.responseXML;
     if (jQL.isFunction(callback)) {
        callback(xhr.responseText, xhr.status);
     }
  },

  error: function(xhr, callback) {
     jQL.ajax.status = xhr.status;
     jQL.ajax.statusText = xhr.statusText;
     if (jQL.isFunction(callback)) {
        callback(xhr.status, xhr.statusText);
     }
  }

};

jQL.makeArray = function( array, results ) {
  var ret = results || [];
  if ( array != null ) {
     // The window, strings (and functions) also have 'length'
     // The extra typeof function check is to prevent crashes
     // in Safari 2 (See: #3039)
     if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
        push.call( ret, array );
     } else {
        jQL.merge( ret, array );
     }
  }

  return ret;
};

jQL.inArray = function(e, arr) {
  for (var a = 0; a < arr.length; a++) {
     if (arr[a] === e) {
        return a;
     }
  }
  return -1;
};

jQL.trim = function(str) {
  if (str != null) {
     return str.toString().replace(/^\s*|\s*$/g,"");
  } else {
     return "";
  }
};

/**
* jQLite instance object
* @private
*/
var jQLp = function() {};
jQLp.prototype = {

  selector: "",
  context: null,
  length: 0,
  jquery: "jqlite-1.1.1",

  init: function(s, e) {

     if (!s) {
        return this;
     }

     if (s.nodeType) {
        // A simple node
        this.context = this[0] = s;
        this.length = 1;
     } else if (typeof s === "function") {
        // Short-form document.ready()
        this.ready(s);
     } else {
        var els = [];
        if (s.jquery && typeof s.jquery === "string") {
           // Already jQLite, just grab its elements
           els = s.toArray();
        } else if (jQL.isArray(s)) {
           // An array of elements
           els = s;
        } else if (typeof s === "string" && jQL.trim(s).indexOf("<") == 0 && jQL.trim(s).indexOf(">") != -1) {
           // This is most likely html, so create an element for them
           var elm = getParentElem(s);
           var h = document.createElement(elm);
           h.innerHTML = s;
           // Extract the element
           els = [h.removeChild(h.firstChild)];
           h = null;
        } else {
           var selectors;
           if (s.indexOf(",") != -1) {
              // Multiple selectors - split them
              selectors = s.split(",");
              for (var n = 0; n < selectors.length; n++) {
                 selectors[n] = jQL.trim(selectors[n]);
              }
           } else {
              selectors = [s];
           }

           var multi = [];
           for (var m = 0; m < selectors.length; m++) {
              multi = multi.concat(parseSelector(selectors[m], e));
           }
           els = multi;
        }

        push.apply(this, els);

     }
     return this;
  },

  // CORE

  each: function(fn) {
     return jQL.each(this, fn);
  },

  size: function() {
     return this.length;
  },

  toArray: function() {
     return slice.call( this, 0 );
  },

  ready: function(fn) {
     if (isReady) {
        fn();
     } else {
        readyStack.push(fn);
        return this;
     }
  },

  data: function( key, value ) {
     if ( typeof key === "undefined" && this.length ) {
        return jQuery.data( this[0] );

     } else if ( typeof key === "object" ) {
        return this.each(function() {
           jQuery.data( this, key );
        });
     }

     var parts = key.split(".");
     parts[1] = parts[1] ? "." + parts[1] : "";

     if ( value === undefined ) {

        if ( data === undefined && this.length ) {
           data = jQuery.data( this[0], key );
        }
        return data === undefined && parts[1] ?
           this.data( parts[0] ) :
           data;
     } else {
        return this.each(function() {
           jQuery.data( this, key, value );
        });
     }
  },

  removeData: function( key ) {
     return this.each(function() {
        jQuery.removeData( this, key );
     });
  },

  // CSS

  addClass: function(cName) {
     return this.each(function() {
        if (this.className.length != 0) {
           var cn = this.className.split(" ");
           if (jQL.inArray(cName, cn) == -1) {
              cn.push(cName);
              this.className = cn.join(" ");
           }
        } else {
           this.className = cName;
        }
     });
  },

  removeClass: function(cName) {
     return this.each(function() {
        if (this.className.length != 0) {
           var cn = this.className.split(" ");
           var i = jQL.inArray(cName, cn);
           if (i != -1) {
              cn.splice(i, 1);
              this.className = cn.join(" ");
           }
        }
     });
  },

  hasClass: function(cName) {
     if (this[0].className.length == 0) {
        return false;
     }
     return jQL.inArray(cName, this[0].className.split(" ")) != -1;
  },

  isElementName: function(eName) {
     return (this[0].nodeName.toLowerCase() === eName.toLowerCase());
  },

  toggleClass: function(cName) {
     return this.each(function() {
        if (this.className.length == 0) {
           this.className = cName;
        } else {
           var cn = this.className.split(" ");
           var i = jQL.inArray(cName, cn);
           if (i != -1) {
              cn.splice(i, 1);
           } else {
              cn.push(cName);
           }
           this.className = cn.join(" ");
        }
     });
  },

  hide: function(fn) {
     return this.each(function() {
        if (this.style && this.style["display"] != null) {
           if (this.style["display"].toString() != "none") {
              this._oldDisplay = this.style["display"].toString() || (this.nodeName != "span" ? "block" : "inline");
              this.style["display"] = "none";
           }
        }
        if (jQL.isFunction(fn)) {
           fn(this);
        }
     });
  },

  show: function(fn) {
     return this.each(function() {
        this.style["display"] = ((this._oldDisplay && this._oldDisplay != "" ? this._oldDisplay : null) || (this.nodeName != "span" ? "block" : "inline"));
        if (jQL.isFunction(fn)) {
           fn(this);
        }
     });
  },

  css: function(sel, val) {
     if (typeof sel === "string" && val == null) {
        return this[0].style[fixStyleProp(sel)];
     } else {
        sel = typeof sel === "string" ? makeObj(sel,val) : sel;
        return this.each(function() {
           var self = this;
           if (typeof self.style != "undefined") {
              jQL.each(sel, function(key,value) {
                 value = (typeof value === "number" ? value + "px" : value);
                 var sn = fixStyleProp(key);
                 if (!self.style[sn]) {
                    sn = key;
                 }
                 self.style[sn] = value;
              });
           }
        });
     }
  },

  // AJAX

  load: function(url, params, fn) {
     if (jQL.isFunction(params)) {
        fn = params;
        params = {};
     }
     return this.each(function() {
        var wrapFn = function(data, status) {
           var aC = arguments.callee;
           if (data) {
              // Strip out any scripts first
              var o = stripScripts(data);
              aC.elem.innerHTML = o.data;
              jQL.evalScripts(o.scripts);
           }
           if (jQL.isFunction(aC.cback)) {
              aC.cback(data, status);
           }
        };
        wrapFn.cback = fn;
        wrapFn.elem = this;
        jQL.ajax.send(url, params, wrapFn);
     });
  },

  // HTML

  html: function(h) {
     if (!h) {
        return this[0].innerHTML;
     } else {
        return this.each(function() {
           var o = stripScripts(h);
           this.innerHTML = o.data;
           jQL.evalScripts(o.scripts);
        });
     }
  },

  attr: function(name, value) {
     if (typeof name === "string" && value == null) {
        if (this[0]) {
           return this[0].getAttribute(name);
        } else {
           return "";
        }
     } else {
        return this.each(function() {
           name = typeof name === "string" ? makeObj(name,value) : name;
           for (var i in name) {
              var v = name[i];
              this.setAttribute(i,v);
           }
        });
     }
  },

  eq: function(index) {
     var elms = this.toArray();
     var elm = index < 0 ? elms[elms.length + index] : elms[index];
     this.context = this[0] = elm;
     this.length = 1;
     return this;
  },

  first: function() {
     var elms = this.toArray();
     this.context = this[0] = elms[0];
     this.length = 1;
     return this;
  },

  last: function() {
     var elms = this.toArray();
     this.context = this[0] = elms[elms.length - 1];
     this.length = 1;
     return this;
  },

  index: function(selector) {
     var idx = -1;
     if (this.length != 0) {
        var itm = this[0];
        if (!selector) {
           var parent = this.parent();
           var s = parent[0].firstChild;
           var arr = [];
           while (s != null) {
              if (s.nodeType === DOM_ELEMENT_NODE) {
                 arr.push(s);
              }
              s = s.nextSibling;
           }
           jQL.each(s, function(i) {
              if (this === itm) {
                 idx = i;
                 return false;
              }
           });
        } else {
           var elm = jQL(selector)[0];
           this.each(function(i) {
              if (this === elm) {
                 idx = i;
                 return false;
              }
           });
        }
     }
     return idx;
  },

  next: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var elm = this.nextSibling;
           while (elm != null && elm.nodeType !== DOM_ELEMENT_NODE) {
              elm = elm.nextSibling;
           }
           if (elm != null) {
              arr.push(elm);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.nextSibling;
           while (us != null && us.nodeType !== DOM_ELEMENT_NODE) {
              us = us.nextSibling;
           }
           if (us != null) {
              var found = false;
              pElm.each(function() {
                 if (this == us) {
                    found = true;
                    return false;
                 }
              });
              if (found) {
                 arr.push(us);
              }
           }
        });
     }
     return jQL(arr);
  },

  prev: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var elm = this.previousSibling;
           while (elm != null && elm.nodeType !== DOM_ELEMENT_NODE) {
              elm = elm.previousSibling;
           }
           if (elm != null) {
              arr.push(elm);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.previousSibling;
           while (us != null && us.nodeType !== DOM_ELEMENT_NODE) {
              us = us.previousSibling;
           }
           if (us != null) {
              var found = false;
              pElm.each(function() {
                 if (this == us) {
                    found = true;
                    return false;
                 }
              });
              if (found) {
                 arr.push(us);
              }
           }
        });
     }
     return jQL(arr);
  },

  parent: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           arr.push(this.parentNode);
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this.parentNode;
           var found = false;
           pElm.each(function() {
              if (this == us) {
                 found = true;
                 return false;
              }
           });
           if (found) {
              arr.push(us);
           }
        });
     }
     return jQL(arr);
  },

  parents: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var us = this;
           while (us != document.body) {
              us = us.parentNode;
              arr.push(us);
           }
        });
     } else {
        var pElm = jQL(selector);
        this.each(function() {
           var us = this;
           while (us != document.body) {
              pElm.each(function() {
                 if (this == us) {
                    arr.push(us);
                 }
              });
              us = us.parentNode;
           }
        });
     }
     return jQL(arr);
  },
    
    find : function(selector) {
        var i,
			ret = [],
			self = this,
			len = self.length;

		for ( i = 0; i < len; i++ ) {
			jQL.find( selector, self[ i ], ret );
		}
		return ret;
    },
    
  children: function(selector) {
     var arr = [];
     if (!selector) {
        this.each(function() {
           var us = this.firstChild;
           while (us != null) {
              if (us.nodeType == DOM_ELEMENT_NODE) {
                 arr.push(us);
              }
              us = us.nextSibling;
           }
        });
     } else {
        var cElm = jQL(selector);
        this.each(function() {
           var us = this.firstChild;
           while (us != null) {
              if (us.nodeType == DOM_ELEMENT_NODE) {
                 cElm.each(function() {
                    if (this === us) {
                       arr.push(us);
                    }
                 });
              }
              us = us.nextSibling;
           }
        });
     }
     return jQL(arr);
  },

  append: function(child) {
     child = cleanUp(child);
     return this.each(function() {
        for (var i = 0; i < child.length; i++) {
           this.appendChild(child[i]);
        }
     });
  },

  remove: function(els) {
     return this.each(function() {
        if (els) {
           $(els, this).remove();
        } else {
           var par = this.parentNode;
           par.removeChild(this);
        }
     });
  },

  empty: function() {
     return this.each(function() {
        this.innerHTML = "";
     });
  },

  val: function(value) {
     if (value == null) {
        var v = null;
        if (this && this.length != 0 && typeof this[0].value != "undefined") {
           v = this[0].value;
        }
        return v;
     } else {
        return this.each(function() {
           if (typeof this.value != "undefined") {
              this.value = value;
           }
        });
     }
  },

  // EVENTS

  bind: function(eType, fn) {
     return this.each(function() {
        setHandler(this, eType, fn);
     });
  },

  trigger: function(eType, data) {
     return this.each(function() {
        return fireEvent(this, eType, data);
     });
  },

  submit: function(fn) {
     return this.each(function() {
        if (jQL.isFunction(fn)) {
           setHandler(this, "onsubmit", fn);
        } else {
           if (this.submit) {
              this.submit();
           }
        }
     });
  }

};


// Cleanup functions for the document ready method
if ( document.addEventListener ) {
  DOMContentLoaded = function() {
     document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
     jQL.ready();
  };

} else if ( document.attachEvent ) {
  DOMContentLoaded = function() {
     // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
     if ( document.readyState === "complete" ) {
        document.detachEvent( "onreadystatechange", DOMContentLoaded );
        jQL.ready();
     }
  };
}

// Document Ready
if (!setReady) {
  setReady = true;
  // Catch cases where $(document).ready() is called after the
  // browser event has already occurred.
  if ( document.readyState === "complete" ) {
     return jQL.ready();
  }

  // Mozilla, Opera and webkit nightlies currently support this event
  if ( document.addEventListener ) {
     // Use the handy event callback
     document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

     // A fallback to window.onload, that will always work
     window.addEventListener( "load", jQL.ready, false );

  // If IE event model is used
  } else if ( document.attachEvent ) {
     // ensure firing before onload,
     // maybe late but safe also for iframes
     document.attachEvent("onreadystatechange", DOMContentLoaded);

     // A fallback to window.onload, that will always work
     window.attachEvent( "onload", jQL.ready );
  }
}

var makeObj = function(sel, val) {
  var o = {};
  o[sel] = val;
  return o;
};

var cleanUp = function(els) {
  if (els.nodeType && (els.nodeType === DOM_ELEMENT_NODE ||
             els.nodeType === DOM_DOCUMENT_NODE)) {
     els = [els];
  } else if (typeof els === "string") {
     els = jQL(els).toArray();
  } else if (els.jquery && typeof els.jquery === "string") {
     els = els.toArray();
  }
  return els;
};

var getParentElem = function(str) {
  var s = jQL.trim(str).toLowerCase();
  return s.indexOf("<option") == 0 ? "SELECT" :
            s.indexOf("<li") == 0 ? "UL" :
            s.indexOf("<tr") == 0 ? "TBODY" :
            s.indexOf("<td") == 0 ? "TR" : "DIV";
};

jQL.fn = jQL.prototype;

// Allow extending jQL or jQLp
jQL.extend = jQL.fn.extend = function() {
  // copy reference to target object
  var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
     deep = target;
     target = arguments[1] || {};
     // skip the boolean and the target
     i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
     target = {};
  }

  // extend jQL itself if only one argument is passed
  if ( length === i ) {
     target = this;
     --i;
  }

  for ( ; i < length; i++ ) {
     // Only deal with non-null/undefined values
     if ( (options = arguments[ i ]) != null ) {
        // Extend the base object
        for ( name in options ) {
           src = target[ name ];
           copy = options[ name ];

           // Prevent never-ending loop
           if ( target === copy ) {
              continue;
           }

           // Recurse if we're merging object literal values or arrays
           if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
              var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
                 : jQuery.isArray(copy) ? [] : {};

              // Never move original objects, clone them
              target[ name ] = jQuery.extend( deep, clone, copy );

           // Don't bring in undefined values
           } else if ( copy !== undefined ) {
              target[ name ] = copy;
           }
        }
     }
  }

  // Return the modified object
  return target;
};

// Wire up events
jQL.each("click,dblclick,mouseover,mouseout,mousedown,mouseup,keydown,keypress,keyup,focus,blur,change,select,error,load,unload,scroll,resize,touchstart,touchend,touchmove".split(","),
     function(i, name) {
        jQL.fn[name] = function(fn) {
           return (fn ? this.bind(name, fn) : this.trigger(name));
        };
     });
