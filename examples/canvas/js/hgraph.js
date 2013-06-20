/*! HGraph.js
 * Authors:
 *  Michael Bester <michael@kimili.com>
 *  Ivan DiLernia <ivan@goinvo.com>
 *  Danny Hadley <danny@goinvo.com>
 *  Matt Madonna <matthew@myimedia.com>
 *
 * License:
 * Copyright 2012, Involution Studios <http://goinvo.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
(function( global ) {

var // hGraph namespace definition
    hGraph = { },
    
    // jQuery and d3 namespaces defined in vendor
    jQuery = { },
    d3 = { },
    
    // private (h) variables
    hRootElement = false,
    hGraphInstances = { };

/*
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

var dropHandler = function(node, eventType, fn) {
    node['on'+eventType] = null;
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
  
  unbind: function(eType) {
     return this.each(function() {
        dropHandler(this, eType);
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

// -=- This happens last, as long as jQuery isn't already defined
if (typeof window.jQuery == "undefined") {
  // Export
  jQuery = jQL;
  jQuery.fn = jQLp.prototype;
}

// Allow extending jQL or jQLp
jQuery.extend = jQuery.fn.extend = function() {
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
jQuery.each("click,dblclick,mouseover,mouseout,mousedown,mouseup,keydown,keypress,keyup,focus,blur,change,select,error,load,unload,scroll,resize,touchstart,touchend,touchmove".split(","), function(i, name) {
    jQuery.fn[name] = function(fn) {
        return (fn ? this.bind(name, fn) : this.trigger(name));
    };
});
/* Copyright (c) 2013, Michael Bostock
 * All rights reserved.
 *   
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *   
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * The name Michael Bostock may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
d3.scale = {};

function d3_scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  return start < stop ? [start, stop] : [stop, start];
}

function d3_scaleRange(scale) {
  return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}
d3.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step === Infinity) throw new Error("infinite range");
  var range = [],
       k = d3_range_integerScale(Math.abs(step)),
       i = -1,
       j;
  start *= k, stop *= k, step *= k;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
  else while ((j = start + step * ++i) < stop) range.push(j / k);
  return range;
};

function d3_range_integerScale(x) {
  var k = 1;
  while (x * k % 1) k *= 10;
  return k;
}
// Copies a variable number of methods from source to target.
d3.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

// Method is assumed to be a standard D3 getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}
function d3_Color() {}

d3_Color.prototype.toString = function() {
  return this.rgb() + "";
};
function d3_class(ctor, properties) {
  try {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  } catch (e) {
    ctor.prototype = properties;
  }
}

d3.map = function(object) {
  var map = new d3_Map;
  for (var key in object) map.set(key, object[key]);
  return map;
};

function d3_Map() {}

d3_class(d3_Map, {
  has: function(key) {
    return d3_map_prefix + key in this;
  },
  get: function(key) {
    return this[d3_map_prefix + key];
  },
  set: function(key, value) {
    return this[d3_map_prefix + key] = value;
  },
  remove: function(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  },
  keys: function() {
    var keys = [];
    this.forEach(function(key) { keys.push(key); });
    return keys;
  },
  values: function() {
    var values = [];
    this.forEach(function(key, value) { values.push(value); });
    return values;
  },
  entries: function() {
    var entries = [];
    this.forEach(function(key, value) { entries.push({key: key, value: value}); });
    return entries;
  },
  forEach: function(f) {
    for (var key in this) {
      if (key.charCodeAt(0) === d3_map_prefixCode) {
        f.call(this, key.substring(1), this[key]);
      }
    }
  }
});

var d3_map_prefix = "\0", // prevent collision with built-ins
    d3_map_prefixCode = d3_map_prefix.charCodeAt(0);

d3.hsl = function(h, s, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l)
      : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl))
      : d3_hsl(+h, +s, +l);
};

function d3_hsl(h, s, l) {
  return new d3_Hsl(h, s, l);
}

function d3_Hsl(h, s, l) {
  this.h = h;
  this.s = s;
  this.l = l;
}

var d3_hslPrototype = d3_Hsl.prototype = new d3_Color;

d3_hslPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, this.l / k);
};

d3_hslPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, k * this.l);
};

d3_hslPrototype.rgb = function() {
  return d3_hsl_rgb(this.h, this.s, this.l);
};

function d3_hsl_rgb(h, s, l) {
  var m1,
      m2;

  /* Some simple corrections for h, s and l. */
  h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
  s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
  l = l < 0 ? 0 : l > 1 ? 1 : l;

  /* From FvD 13.37, CSS Color Module Level 3 */
  m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
  m1 = 2 * l - m2;

  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    if (h < 180) return m2;
    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }

  function vv(h) {
    return Math.round(v(h) * 255);
  }

  return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
}
var π = Math.PI,
    ε = 1e-6,
    ε2 = ε * ε,
    d3_radians = π / 180,
    d3_degrees = 180 / π;

function d3_sgn(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

function d3_acos(x) {
  return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
}

function d3_asin(x) {
  return x > 1 ? π / 2 : x < -1 ? -π / 2 : Math.asin(x);
}

function d3_sinh(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

function d3_cosh(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
}

function d3_haversin(x) {
  return (x = Math.sin(x / 2)) * x;
}

d3.hcl = function(h, c, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l)
      : (h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b)
      : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b)))
      : d3_hcl(+h, +c, +l);
};

function d3_hcl(h, c, l) {
  return new d3_Hcl(h, c, l);
}

function d3_Hcl(h, c, l) {
  this.h = h;
  this.c = c;
  this.l = l;
}

var d3_hclPrototype = d3_Hcl.prototype = new d3_Color;

d3_hclPrototype.brighter = function(k) {
  return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.darker = function(k) {
  return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.rgb = function() {
  return d3_hcl_lab(this.h, this.c, this.l).rgb();
};

function d3_hcl_lab(h, c, l) {
  if (isNaN(h)) h = 0;
  if (isNaN(c)) c = 0;
  return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
}

d3.lab = function(l, a, b) {
  return arguments.length === 1
      ? (l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b)
      : (l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h)
      : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b)))
      : d3_lab(+l, +a, +b);
};

function d3_lab(l, a, b) {
  return new d3_Lab(l, a, b);
}

function d3_Lab(l, a, b) {
  this.l = l;
  this.a = a;
  this.b = b;
}

// Corresponds roughly to RGB brighter/darker
var d3_lab_K = 18;

// D65 standard referent
var d3_lab_X = 0.950470,
    d3_lab_Y = 1,
    d3_lab_Z = 1.088830;

var d3_labPrototype = d3_Lab.prototype = new d3_Color;

d3_labPrototype.brighter = function(k) {
  return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.darker = function(k) {
  return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.rgb = function() {
  return d3_lab_rgb(this.l, this.a, this.b);
};

function d3_lab_rgb(l, a, b) {
  var y = (l + 16) / 116,
      x = y + a / 500,
      z = y - b / 200;
  x = d3_lab_xyz(x) * d3_lab_X;
  y = d3_lab_xyz(y) * d3_lab_Y;
  z = d3_lab_xyz(z) * d3_lab_Z;
  return d3_rgb(
    d3_xyz_rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    d3_xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
    d3_xyz_rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
  );
}

function d3_lab_hcl(l, a, b) {
  return l > 0
      ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l)
      : d3_hcl(NaN, NaN, l);
}

function d3_lab_xyz(x) {
  return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
}
function d3_xyz_lab(x) {
  return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
}

function d3_xyz_rgb(r) {
  return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
}

d3.rgb = function(r, g, b) {
  return arguments.length === 1
      ? (r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b)
      : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb))
      : d3_rgb(~~r, ~~g, ~~b);
};

function d3_rgb(r, g, b) {
  return new d3_Rgb(r, g, b);
}

function d3_Rgb(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color;

d3_rgbPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  var r = this.r,
      g = this.g,
      b = this.b,
      i = 30;
  if (!r && !g && !b) return d3_rgb(i, i, i);
  if (r && r < i) r = i;
  if (g && g < i) g = i;
  if (b && b < i) b = i;
  return d3_rgb(
      Math.min(255, Math.floor(r / k)),
      Math.min(255, Math.floor(g / k)),
      Math.min(255, Math.floor(b / k)));
};

d3_rgbPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_rgb(
      Math.floor(k * this.r),
      Math.floor(k * this.g),
      Math.floor(k * this.b));
};

d3_rgbPrototype.hsl = function() {
  return d3_rgb_hsl(this.r, this.g, this.b);
};

d3_rgbPrototype.toString = function() {
  return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
};

function d3_rgb_hex(v) {
  return v < 0x10
      ? "0" + Math.max(0, v).toString(16)
      : Math.min(255, v).toString(16);
}

function d3_rgb_parse(format, rgb, hsl) {
  var r = 0, // red channel; int in [0, 255]
      g = 0, // green channel; int in [0, 255]
      b = 0, // blue channel; int in [0, 255]
      m1, // CSS color specification match
      m2, // CSS color specification type (e.g., rgb)
      name;

  /* Handle hsl, rgb. */
  m1 = /([a-z]+)\((.*)\)/i.exec(format);
  if (m1) {
    m2 = m1[2].split(",");
    switch (m1[1]) {
      case "hsl": {
        return hsl(
          parseFloat(m2[0]), // degrees
          parseFloat(m2[1]) / 100, // percentage
          parseFloat(m2[2]) / 100 // percentage
        );
      }
      case "rgb": {
        return rgb(
          d3_rgb_parseNumber(m2[0]),
          d3_rgb_parseNumber(m2[1]),
          d3_rgb_parseNumber(m2[2])
        );
      }
    }
  }

  /* Named colors. */
  if (name = d3_rgb_names.get(format)) return rgb(name.r, name.g, name.b);

  /* Hexadecimal colors: #rgb and #rrggbb. */
  if (format != null && format.charAt(0) === "#") {
    if (format.length === 4) {
      r = format.charAt(1); r += r;
      g = format.charAt(2); g += g;
      b = format.charAt(3); b += b;
    } else if (format.length === 7) {
      r = format.substring(1, 3);
      g = format.substring(3, 5);
      b = format.substring(5, 7);
    }
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
  }

  return rgb(r, g, b);
}

function d3_rgb_hsl(r, g, b) {
  var min = Math.min(r /= 255, g /= 255, b /= 255),
      max = Math.max(r, g, b),
      d = max - min,
      h,
      s,
      l = (max + min) / 2;
  if (d) {
    s = l < .5 ? d / (max + min) : d / (2 - max - min);
    if (r == max) h = (g - b) / d + (g < b ? 6 : 0);
    else if (g == max) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  } else {
    h = NaN;
    s = l > 0 && l < 1 ? 0 : h;
  }
  return d3_hsl(h, s, l);
}

function d3_rgb_lab(r, g, b) {
  r = d3_rgb_xyz(r);
  g = d3_rgb_xyz(g);
  b = d3_rgb_xyz(b);
  var x = d3_xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / d3_lab_X),
      y = d3_xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / d3_lab_Y),
      z = d3_xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / d3_lab_Z);
  return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
}

function d3_rgb_xyz(r) {
  return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
}

function d3_rgb_parseNumber(c) { // either integer or percentage
  var f = parseFloat(c);
  return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
}

var d3_rgb_names = d3.map({
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
});

d3_rgb_names.forEach(function(key, value) {
  d3_rgb_names.set(key, d3_rgb_parse(value, d3_rgb, d3_hsl_rgb));
});

d3.interpolateRgb = d3_interpolateRgb;

function d3_interpolateRgb(a, b) {
  a = d3.rgb(a);
  b = d3.rgb(b);
  var ar = a.r,
      ag = a.g,
      ab = a.b,
      br = b.r - ar,
      bg = b.g - ag,
      bb = b.b - ab;
  return function(t) {
    return "#"
        + d3_rgb_hex(Math.round(ar + br * t))
        + d3_rgb_hex(Math.round(ag + bg * t))
        + d3_rgb_hex(Math.round(ab + bb * t));
  };
}
var d3_document = document,
    d3_documentElement = d3_document.documentElement,
    d3_window = window;
var d3_nsPrefix = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: "http://www.w3.org/1999/xhtml",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

d3.ns = {
  prefix: d3_nsPrefix,
  qualify: function(name) {
    var i = name.indexOf(":"),
        prefix = name;
    if (i >= 0) {
      prefix = name.substring(0, i);
      name = name.substring(i + 1);
    }
    return d3_nsPrefix.hasOwnProperty(prefix)
        ? {space: d3_nsPrefix[prefix], local: name}
        : name;
  }
};

d3.transform = function(string) {
  var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
  return (d3.transform = function(string) {
    if (string != null) {
      g.setAttribute("transform", string);
      var t = g.transform.baseVal.consolidate();
    }
    return new d3_transform(t ? t.matrix : d3_transformIdentity);
  })(string);
};

// Compute x-scale and normalize the first row.
// Compute shear and make second row orthogonal to first.
// Compute y-scale and normalize the second row.
// Finally, compute the rotation.
function d3_transform(m) {
  var r0 = [m.a, m.b],
      r1 = [m.c, m.d],
      kx = d3_transformNormalize(r0),
      kz = d3_transformDot(r0, r1),
      ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
  if (r0[0] * r1[1] < r1[0] * r0[1]) {
    r0[0] *= -1;
    r0[1] *= -1;
    kx *= -1;
    kz *= -1;
  }
  this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
  this.translate = [m.e, m.f];
  this.scale = [kx, ky];
  this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
};

d3_transform.prototype.toString = function() {
  return "translate(" + this.translate
      + ")rotate(" + this.rotate
      + ")skewX(" + this.skew
      + ")scale(" + this.scale
      + ")";
};

function d3_transformDot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function d3_transformNormalize(a) {
  var k = Math.sqrt(d3_transformDot(a, a));
  if (k) {
    a[0] /= k;
    a[1] /= k;
  }
  return k;
}

function d3_transformCombine(a, b, k) {
  a[0] += k * b[0];
  a[1] += k * b[1];
  return a;
}

var d3_transformIdentity = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
d3.interpolateNumber = d3_interpolateNumber;

function d3_interpolateNumber(a, b) {
  b -= a = +a;
  return function(t) { return a + b * t; };
}

d3.interpolateTransform = d3_interpolateTransform;

function d3_interpolateTransform(a, b) {
  var s = [], // string constants and placeholders
      q = [], // number interpolators
      n,
      A = d3.transform(a),
      B = d3.transform(b),
      ta = A.translate,
      tb = B.translate,
      ra = A.rotate,
      rb = B.rotate,
      wa = A.skew,
      wb = B.skew,
      ka = A.scale,
      kb = B.scale;

  if (ta[0] != tb[0] || ta[1] != tb[1]) {
    s.push("translate(", null, ",", null, ")");
    q.push({i: 1, x: d3_interpolateNumber(ta[0], tb[0])}, {i: 3, x: d3_interpolateNumber(ta[1], tb[1])});
  } else if (tb[0] || tb[1]) {
    s.push("translate(" + tb + ")");
  } else {
    s.push("");
  }

  if (ra != rb) {
    if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360; // shortest path
    q.push({i: s.push(s.pop() + "rotate(", null, ")") - 2, x: d3_interpolateNumber(ra, rb)});
  } else if (rb) {
    s.push(s.pop() + "rotate(" + rb + ")");
  }

  if (wa != wb) {
    q.push({i: s.push(s.pop() + "skewX(", null, ")") - 2, x: d3_interpolateNumber(wa, wb)});
  } else if (wb) {
    s.push(s.pop() + "skewX(" + wb + ")");
  }

  if (ka[0] != kb[0] || ka[1] != kb[1]) {
    n = s.push(s.pop() + "scale(", null, ",", null, ")");
    q.push({i: n - 4, x: d3_interpolateNumber(ka[0], kb[0])}, {i: n - 2, x: d3_interpolateNumber(ka[1], kb[1])});
  } else if (kb[0] != 1 || kb[1] != 1) {
    s.push(s.pop() + "scale(" + kb + ")");
  }

  n = q.length;
  return function(t) {
    var i = -1, o;
    while (++i < n) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

d3.interpolateObject = d3_interpolateObject;

function d3_interpolateObject(a, b) {
  var i = {},
      c = {},
      k;
  for (k in a) {
    if (k in b) {
      i[k] = d3_interpolateByName(k)(a[k], b[k]);
    } else {
      c[k] = a[k];
    }
  }
  for (k in b) {
    if (!(k in a)) {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

d3.interpolateArray = d3_interpolateArray;

function d3_interpolateArray(a, b) {
  var x = [],
      c = [],
      na = a.length,
      nb = b.length,
      n0 = Math.min(a.length, b.length),
      i;
  for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
  for (; i < na; ++i) c[i] = a[i];
  for (; i < nb; ++i) c[i] = b[i];
  return function(t) {
    for (i = 0; i < n0; ++i) c[i] = x[i](t);
    return c;
  };
}

d3.interpolateString = d3_interpolateString;

function d3_interpolateString(a, b) {
  var m, // current match
      i, // current index
      j, // current index (for coalescing)
      s0 = 0, // start index of current string prefix
      s1 = 0, // end index of current string prefix
      s = [], // string constants and placeholders
      q = [], // number interpolators
      n, // q.length
      o;

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Reset our regular expression!
  d3_interpolate_number.lastIndex = 0;

  // Find all numbers in b.
  for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
    if (m.index) s.push(b.substring(s0, s1 = m.index));
    q.push({i: s.length, x: m[0]});
    s.push(null);
    s0 = d3_interpolate_number.lastIndex;
  }
  if (s0 < b.length) s.push(b.substring(s0));

  // Find all numbers in a.
  for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
    o = q[i];
    if (o.x == m[0]) { // The numbers match, so coalesce.
      if (o.i) {
        if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i - 1] += o.x;
          s.splice(o.i, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i - 1] += o.x + s[o.i + 1];
          s.splice(o.i, 2);
          for (j = i + 1; j < n; ++j) q[j].i -= 2;
        }
      } else {
          if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i] = o.x;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i] = o.x + s[o.i + 1];
          s.splice(o.i + 1, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        }
      }
      q.splice(i, 1);
      n--;
      i--;
    } else {
      o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
    }
  }

  // Remove any numbers in b not found in a.
  while (i < n) {
    o = q.pop();
    if (s[o.i + 1] == null) { // This match is followed by another number.
      s[o.i] = o.x;
    } else { // This match is followed by a string, so coalesce twice.
      s[o.i] = o.x + s[o.i + 1];
      s.splice(o.i + 1, 1);
    }
    n--;
  }

  // Special optimization for only a single match.
  if (s.length === 1) {
    return s[0] == null
        ? (o = q[0].x, function(t) { return o(t) + ""; })
        : function() { return b; };
  }

  // Otherwise, interpolate each of the numbers and rejoin the string.
  return function(t) {
    for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;

d3.interpolate = d3_interpolate;

function d3_interpolate(a, b) {
  var i = d3.interpolators.length, f;
  while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
  return f;
}

function d3_interpolateByName(name) {
  return name == "transform"
      ? d3_interpolateTransform
      : d3_interpolate;
}

d3.interpolators = [
  function(a, b) {
    var t = typeof b;
    return (t === "string" ? (d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString)
        : b instanceof d3_Color ? d3_interpolateRgb
        : t === "object" ? (Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject)
        : d3_interpolateNumber)(a, b);
  }
];
d3.interpolateRound = d3_interpolateRound;

function d3_interpolateRound(a, b) {
  b -= a;
  return function(t) { return Math.round(a + b * t); };
}
function d3_uninterpolateNumber(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return (x - a) * b; };
}

function d3_uninterpolateClamp(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return Math.max(0, Math.min(1, (x - a) * b)); };
}
function d3_identity(d) {
  return d;
}
var d3_format_decimalPoint = ".",
    d3_format_thousandsSeparator = ",",
    d3_format_grouping = [3, 3];


var d3_formatPrefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"].map(d3_formatPrefix);

d3.formatPrefix = function(value, precision) {
  var i = 0;
  if (value) {
    if (value < 0) value *= -1;
    if (precision) value = d3.round(value, d3_format_precision(value, precision));
    i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
    i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
  }
  return d3_formatPrefixes[8 + i / 3];
};

function d3_formatPrefix(d, i) {
  var k = Math.pow(10, Math.abs(8 - i) * 3);
  return {
    scale: i > 8 ? function(d) { return d / k; } : function(d) { return d * k; },
    symbol: d
  };
}
d3.round = function(x, n) {
  return n
      ? Math.round(x * (n = Math.pow(10, n))) / n
      : Math.round(x);
};

d3.format = function(specifier) {
  var match = d3_format_re.exec(specifier),
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "",
      basePrefix = match[4] || "",
      zfill = match[5],
      width = +match[6],
      comma = match[7],
      precision = match[8],
      type = match[9],
      scale = 1,
      suffix = "",
      integer = false;

  if (precision) precision = +precision.substring(1);

  if (zfill || fill === "0" && align === "=") {
    zfill = fill = "0";
    align = "=";
    if (comma) width -= Math.floor((width - 1) / 4);
  }

  switch (type) {
    case "n": comma = true; type = "g"; break;
    case "%": scale = 100; suffix = "%"; type = "f"; break;
    case "p": scale = 100; suffix = "%"; type = "r"; break;
    case "b":
    case "o":
    case "x":
    case "X": if (basePrefix) basePrefix = "0" + type.toLowerCase();
    case "c":
    case "d": integer = true; precision = 0; break;
    case "s": scale = -1; type = "r"; break;
  }

  if (basePrefix === "#") basePrefix = "";

  // If no precision is specified for r, fallback to general notation.
  if (type == "r" && !precision) type = "g";

  // Ensure that the requested precision is in the supported range.
  if (precision != null) {
    if (type == "g") precision = Math.max(1, Math.min(21, precision));
    else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
  }

  type = d3_format_types.get(type) || d3_format_typeDefault;

  var zcomma = zfill && comma;

  return function(value) {

    // Return the empty string for floats formatted as ints.
    if (integer && (value % 1)) return "";

    // Convert negative to positive, and record the sign prefix.
    var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;

    // Apply the scale, computing it from the value's exponent for si format.
    if (scale < 0) {
      var prefix = d3.formatPrefix(value, precision);
      value = prefix.scale(value);
      suffix = prefix.symbol;
    } else {
      value *= scale;
    }

    // Convert to the desired precision.
    value = type(value, precision);

     // If the fill character is not "0", grouping is applied before padding.
    if (!zfill && comma) value = d3_format_group(value);

    var length = basePrefix.length + value.length + (zcomma ? 0 : negative.length),
        padding = length < width ? new Array(length = width - length + 1).join(fill) : "";

    // If the fill character is "0", grouping is applied after padding.
    if (zcomma) value = d3_format_group(padding + value);

    if (d3_format_decimalPoint) value.replace(".", d3_format_decimalPoint);

    negative += basePrefix;

    return (align === "<" ? negative + value + padding
          : align === ">" ? padding + negative + value
          : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length)
          : negative + (zcomma ? value : padding + value)) + suffix;
  };
};

// [[fill]align][sign][#][0][width][,][.precision][type]
var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;

var d3_format_types = d3.map({
  b: function(x) { return x.toString(2); },
  c: function(x) { return String.fromCharCode(x); },
  o: function(x) { return x.toString(8); },
  x: function(x) { return x.toString(16); },
  X: function(x) { return x.toString(16).toUpperCase(); },
  g: function(x, p) { return x.toPrecision(p); },
  e: function(x, p) { return x.toExponential(p); },
  f: function(x, p) { return x.toFixed(p); },
  r: function(x, p) { return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p)))); }
});

function d3_format_precision(x, p) {
  return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
}

function d3_format_typeDefault(x) {
  return x + "";
}

// Apply comma grouping for thousands.
var d3_format_group = d3_identity;
if (d3_format_grouping) {
  var d3_format_groupingLength = d3_format_grouping.length;
  d3_format_group = function(value) {
    var i = value.lastIndexOf("."),
        f = i >= 0 ? "." + value.substring(i + 1) : (i = value.length, ""),
        t = [],
        j = 0,
        g = d3_format_grouping[0];
    while (i > 0 && g > 0) {
      t.push(value.substring(i -= g, i + g));
      g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
    }
    return t.reverse().join(d3_format_thousandsSeparator || "") + f;
  };
}
function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
  var u = uninterpolate(domain[0], domain[1]),
      i = interpolate(range[0], range[1]);
  return function(x) {
    return i(u(x));
  };
}
function d3_scale_nice(domain, nice) {
  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      dx;

  if (x1 < x0) {
    dx = i0, i0 = i1, i1 = dx;
    dx = x0, x0 = x1, x1 = dx;
  }

  domain[i0] = nice.floor(x0);
  domain[i1] = nice.ceil(x1);
  return domain;
}

function d3_scale_niceStep(step) {
  return step ? {
    floor: function(x) { return Math.floor(x / step) * step; },
    ceil: function(x) { return Math.ceil(x / step) * step; }
  } : d3_scale_niceIdentity;
}

var d3_scale_niceIdentity = {
  floor: d3_identity,
  ceil: d3_identity
};
d3.bisector = function(f) {
  return {
    left: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f.call(a, a[mid], mid) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f.call(a, a[mid], mid)) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

var d3_bisector = d3.bisector(function(d) { return d; });
d3.bisectLeft = d3_bisector.left;
d3.bisect = d3.bisectRight = d3_bisector.right;

function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
  var u = [],
      i = [],
      j = 0,
      k = Math.min(domain.length, range.length) - 1;

  // Handle descending domains.
  if (domain[k] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++j <= k) {
    u.push(uninterpolate(domain[j - 1], domain[j]));
    i.push(interpolate(range[j - 1], range[j]));
  }

  return function(x) {
    var j = d3.bisect(domain, x, 1, k) - 1;
    return i[j](u[j](x));
  };
}

d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3_interpolate, false);
};

function d3_scale_linear(domain, range, interpolate, clamp) {
  var output,
      input;

  function rescale() {
    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3_interpolate);
    return scale;
  }

  function scale(x) {
    return output(x);
  }

  // Note: requires range is coercible to number!
  scale.invert = function(y) {
    return input(y);
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(Number);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3_interpolateRound);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return clamp;
    clamp = x;
    return rescale();
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    d3_scale_linearNice(domain, m);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, interpolate, clamp);
  };

  return rescale();
}

function d3_scale_linearRebind(scale, linear) {
  return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
}

function d3_scale_linearNice(domain, m) {
  return d3_scale_nice(domain, d3_scale_niceStep(m
      ? d3_scale_linearTickRange(domain, m)[2]
      : d3_scale_linearNiceStep(domain)));
}

function d3_scale_linearNiceStep(domain) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0];
  return Math.pow(10, Math.round(Math.log(span) / Math.LN10) - 1);
}

function d3_scale_linearTickRange(domain, m) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_linearTicks(domain, m) {
  return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
}

function d3_scale_linearTickFormat(domain, m, format) {
  var precision = -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01);
  return d3.format(format
      ? format.replace(d3_format_re, function(a, b, c, d, e, f, g, h, i, j) { return [b, c, d, e, f, g, h, i || "." + (precision - (j === "%") * 2), j].join(""); })
      : ",." + precision + "f");
}

d3.scale.log = function() {
  return d3_scale_log(d3.scale.linear().domain([0, Math.LN10]), 10, d3_scale_logp, d3_scale_powp, [1, 10]);
};

function d3_scale_log(linear, base, log, pow, domain) {

  function scale(x) {
    return linear(log(x));
  }

  scale.invert = function(x) {
    return pow(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    if (x[0] < 0) log = d3_scale_logn, pow = d3_scale_pown;
    else log = d3_scale_logp, pow = d3_scale_powp;
    linear.domain((domain = x.map(Number)).map(log));
    return scale;
  };

  scale.base = function(_) {
    if (!arguments.length) return base;
    base = +_;
    return scale;
  };

  scale.nice = function() {

    function floor(x) {
      return Math.pow(base, Math.floor(Math.log(x) / Math.log(base)));
    }

    function ceil(x) {
      return Math.pow(base, Math.ceil(Math.log(x) / Math.log(base)));
    }

    linear.domain(d3_scale_nice(domain, log === d3_scale_logp
        ? {floor: floor, ceil: ceil}
        : {floor: function(x) { return -ceil(-x); }, ceil: function(x) { return -floor(-x); }}).map(log));

    return scale;
  };

  scale.ticks = function() {
    var extent = d3_scaleExtent(linear.domain()),
        ticks = [];
    if (extent.every(isFinite)) {
      var b = Math.log(base),
          i = Math.floor(extent[0] / b),
          j = Math.ceil(extent[1] / b),
          u = pow(extent[0]),
          v = pow(extent[1]),
          n = base % 1 ? 2 : base;
      if (log === d3_scale_logn) {
        ticks.push(-Math.pow(base, -i));
        for (; i++ < j;) for (var k = n - 1; k > 0; k--) ticks.push(-Math.pow(base, -i) * k);
      } else {
        for (; i < j; i++) for (var k = 1; k < n; k++) ticks.push(Math.pow(base, i) * k);
        ticks.push(Math.pow(base, i));
      }
      for (i = 0; ticks[i] < u; i++) {} // strip small values
      for (j = ticks.length; ticks[j - 1] > v; j--) {} // strip big values
      ticks = ticks.slice(i, j);
    }
    return ticks;
  };

  scale.tickFormat = function(n, format) {
    if (!arguments.length) return d3_scale_logFormat;
    if (arguments.length < 2) format = d3_scale_logFormat;
    else if (typeof format !== "function") format = d3.format(format);
    var b = Math.log(base),
        k = Math.max(.1, n / scale.ticks().length),
        f = log === d3_scale_logn ? (e = -1e-12, Math.floor) : (e = 1e-12, Math.ceil),
        e;
    return function(d) {
      return d / pow(b * f(log(d) / b + e)) <= k ? format(d) : "";
    };
  };

  scale.copy = function() {
    return d3_scale_log(linear.copy(), base, log, pow, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

var d3_scale_logFormat = d3.format(".0e");

function d3_scale_logp(x) {
  return Math.log(x < 0 ? 0 : x);
}

function d3_scale_powp(x) {
  return Math.exp(x);
}

function d3_scale_logn(x) {
  return -Math.log(x > 0 ? 0 : -x);
}

function d3_scale_pown(x) {
  return -Math.exp(-x);
}

d3.scale.pow = function() {
  return d3_scale_pow(d3.scale.linear(), 1, [0, 1]);
};

function d3_scale_pow(linear, exponent, domain) {
  var powp = d3_scale_powPow(exponent),
      powb = d3_scale_powPow(1 / exponent);

  function scale(x) {
    return linear(powp(x));
  }

  scale.invert = function(x) {
    return powb(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    linear.domain((domain = x.map(Number)).map(powp));
    return scale;
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    return scale.domain(d3_scale_linearNice(domain, m));
  };

  scale.exponent = function(x) {
    if (!arguments.length) return exponent;
    powp = d3_scale_powPow(exponent = x);
    powb = d3_scale_powPow(1 / exponent);
    linear.domain(domain.map(powp));
    return scale;
  };

  scale.copy = function() {
    return d3_scale_pow(linear.copy(), exponent, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

function d3_scale_powPow(e) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
  };
}

d3.scale.sqrt = function() {
  return d3.scale.pow().exponent(.5);
};

d3.scale.ordinal = function() {
  return d3_scale_ordinal([], {t: "range", a: [[]]});
};

function d3_scale_ordinal(domain, ranger) {
  var index,
      range,
      rangeBand;

  function scale(x) {
    return range[((index.get(x) || index.set(x, domain.push(x))) - 1) % range.length];
  }

  function steps(start, step) {
    return d3.range(domain.length).map(function(i) { return start + step * i; });
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = [];
    index = new d3_Map;
    var i = -1, n = x.length, xi;
    while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
    return scale[ranger.t].apply(scale, ranger.a);
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    rangeBand = 0;
    ranger = {t: "range", a: arguments};
    return scale;
  };

  scale.rangePoints = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
    range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
    rangeBand = 0;
    ranger = {t: "rangePoints", a: arguments};
    return scale;
  };

  scale.rangeBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = (stop - start) / (domain.length - padding + 2 * outerPadding);
    range = steps(start + step * outerPadding, step);
    if (reverse) range.reverse();
    rangeBand = step * (1 - padding);
    ranger = {t: "rangeBands", a: arguments};
    return scale;
  };

  scale.rangeRoundBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)),
        error = stop - start - (domain.length - padding) * step;
    range = steps(start + Math.round(error / 2), step);
    if (reverse) range.reverse();
    rangeBand = Math.round(step * (1 - padding));
    ranger = {t: "rangeRoundBands", a: arguments};
    return scale;
  };

  scale.rangeBand = function() {
    return rangeBand;
  };

  scale.rangeExtent = function() {
    return d3_scaleExtent(ranger.a[0]);
  };

  scale.copy = function() {
    return d3_scale_ordinal(domain, ranger);
  };

  return scale.domain(domain);
}

/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/). See lib/colorbrewer for more information.
 */

d3.scale.category10 = function() {
  return d3.scale.ordinal().range(d3_category10);
};

d3.scale.category20 = function() {
  return d3.scale.ordinal().range(d3_category20);
};

d3.scale.category20b = function() {
  return d3.scale.ordinal().range(d3_category20b);
};

d3.scale.category20c = function() {
  return d3.scale.ordinal().range(d3_category20c);
};

var d3_category10 = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

var d3_category20 = [
  "#1f77b4", "#aec7e8",
  "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a",
  "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2",
  "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5"
];

var d3_category20b = [
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
  "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
  "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
  "#843c39", "#ad494a", "#d6616b", "#e7969c",
  "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

var d3_category20c = [
  "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
  "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
  "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
  "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
  "#636363", "#969696", "#bdbdbd", "#d9d9d9"
];
d3.ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};
// R-7 per <http://en.wikipedia.org/wiki/Quantile>
d3.quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = +values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

d3.scale.quantile = function() {
  return d3_scale_quantile([], []);
};

function d3_scale_quantile(domain, range) {
  var thresholds;

  function rescale() {
    var k = 0,
        q = range.length;
    thresholds = [];
    while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
    return scale;
  }

  function scale(x) {
    if (isNaN(x = +x)) return NaN;
    return range[d3.bisect(thresholds, x)];
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.filter(function(d) { return !isNaN(d); }).sort(d3.ascending);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.quantiles = function() {
    return thresholds;
  };

  scale.copy = function() {
    return d3_scale_quantile(domain, range); // copy on write!
  };

  return rescale();
}

d3.scale.quantize = function() {
  return d3_scale_quantize(0, 1, [0, 1]);
};

function d3_scale_quantize(x0, x1, range) {
  var kx, i;

  function scale(x) {
    return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
  }

  function rescale() {
    kx = range.length / (x1 - x0);
    i = range.length - 1;
    return scale;
  }

  scale.domain = function(x) {
    if (!arguments.length) return [x0, x1];
    x0 = +x[0];
    x1 = +x[x.length - 1];
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_quantize(x0, x1, range); // copy on write
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    y = y < 0 ? NaN : y / kx + x0;
    return [y, y + 1 / kx];
  };

  return rescale();
}

d3.scale.threshold = function() {
  return d3_scale_threshold([.5], [0, 1]);
};

function d3_scale_threshold(domain, range) {

  function scale(x) {
    return range[d3.bisect(domain, x)];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain;
    domain = _;
    return scale;
  };

  scale.range = function(_) {
    if (!arguments.length) return range;
    range = _;
    return scale;
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    return [domain[y - 1], domain[y]];
  };

  scale.copy = function() {
    return d3_scale_threshold(domain, range);
  };

  return scale;
};

d3.scale.identity = function() {
  return d3_scale_identity([0, 1]);
};

function d3_scale_identity(domain) {

  function identity(x) { return +x; }

  identity.invert = identity;

  identity.domain = identity.range = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(identity);
    return identity;
  };

  identity.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  identity.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  identity.copy = function() {
    return d3_scale_identity(domain);
  };

  return identity;
}
var DEFAULTS = { };
DEFAULTS['HGRAPH_WIDTH'] = 960;
DEFAULTS['HGRAPH_HEIGHT'] = 720;
DEFAULTS['HGRAPH_INNER_RADIUS'] = 120;
DEFAULTS['HGRAPH_OUTER_RADIUS'] = 200;

DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] = ['data-hgraph-app','hgraph-app'];
DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'] = ['data-hgraph-graph','hgraph-graph'];
// math functions
var ceil = Math.ceil;
var floor = Math.floor;

// array shortcuts
var slice = Array.prototype.slice;

// obj functions
var hasOwn = Object.prototype.hasOwnProperty;

// jqLite functions
var isArr = jQuery.isArray;
var isStr = jQuery.isString;
var isFn = jQuery.isFunction;
// createUID
// returns a new unique identifier string to be used in hashes
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return "uid-" + (++uid);
    });
})( );


// inject
// creates a function that calls the function being passed in
// as the first parameter with references to the specific objects
// that are passed in as the second
// @param {function} the function that will be used
// @param [array] the parameters that should be used in the new function
// @param {self} the context (if any) to use when calling 'apply' on the function
var inject = function( fn, params, self ) {

    if( !isArr( params ) || !isFn( fn ) )
        return function( ) { };
    
    var context = self ? self : { };
    
    return function( ) {
        if( arguments.length > 0 )
            return fn.apply( context, params.concat( slice.call( arguments, 0 ) ) );
            
        fn.apply( context, params );
    };
    
};
// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = (function( config ){ 

function InternalDraw( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent( 'transform' )
    locals.device.clearRect( 0, 0, transform.size.width, transform.size.height );
    
    // loop through all components and draw them
    var components = locals['components'], name;
    for( name in components )
        components[name].Draw( );
    
};

function InternalUpdate( locals ) {
    if( !this.ready )
        return false;
    
    // loop through all components and update them
    var components = locals['components'], name;
    for( name in components )
        components[name].Update( );
        
    this.invokeQueue.push( inject( InternalDraw, [ locals ], this ) );
    return this.ExecuteQueue( );  
};

function InternalMouseMove( locals, evt ) {
    if( !this.ready )
        return false;
        
    locals['mouse'].x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].y = evt.pageY - locals['container'].offsetTop;
    
    if( locals['mouse'].isDown && locals.GetComponent('transform') )
        locals.GetComponent('transform').Move( locals['mouse'].x, locals['mouse'].y );
        
    // mouse move is an event where we need to update, add it to the queue and execute
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseUp( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].isDown = false;
};

function InternalMouseDown( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].isDown = true;
        
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;

    // loop through all components and initialize them
    var components = locals['components'], name;
    for( name in components )
        components[name].Initialize( locals );

    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function Graph( config ) {
    // while the graph is being prepared, it is not ready
    this.ready = false;
    
    // if no configuration was passed in for this graph, end    
    if( !config )
        return false;
    
    var // local references
        _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _uiLayer = document.createElement('uiLayer'),
        _device = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _components = { };
    
    // add the components that will make up this graph
    _components['transform'] = new hGraph.Graph.Transform( );
    _components['ring'] = new hGraph.Graph.Ring( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        uiLayer : _uiLayer,
        device : _device,
        mouse : _mouse,
        components : _components
    };
    locals.GetComponent = function( name ) {
        return this.components[name] || false;
    };

    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
        // add the ui div(layer) to the container
        _container.appendChild( _uiLayer );
    } catch( e ) {
        this.ready = false;
        return console.error('hGraph was unable to create a graph in the container');
    }
    
    
    var MouseMove = inject( InternalMouseMove, [ locals ], this ),
        MouseDown = inject( InternalMouseDown, [ locals ], this ),
        MouseUp = inject( InternalMouseUp, [ locals ], this );
    
    jQuery( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] );
    
    // prep the ui layer and add events
    jQuery( _uiLayer )
        .attr( 'hgraph-layer', 'ui' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp );
    
    // flag the graph as being ready for initialization
    this.ready = true;
    
    // the invoke queue starts with initialization 
    this.invokeQueue = [ inject( InternalInitialize, [ locals ], this ) ];
};

Graph.prototype = {
        
    constructor : Graph,    
    
    Initialize : function( ) {
        if( this.ready )
            this.ExecuteQueue( );
    },
    
    ExecuteQueue : function( ) {
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};

return Graph;

})( );

/*

return Graph;

    this.ready = false;
    
    if( !config )
        return false;
    
    // private:
    var _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _uiLayer = document.createElement('uiLayer'),
        _device = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _transform = { 
            position : { x : 0, y : 0 },
            rotation : 0,
            scale : 1.0,
            size : { 
                width : DEFAULTS['HGRAPH_WIDTH'],
                height : DEFAULTS['HGRAPH_HEIGHT']
            }
        },
        _components = [ ];
    
    // add the components that will make up this graph
    _components.push( new hGraph.Graph.Ring( ) );
    
    // InternalDraw
    // called whenever the canvas needs to be updated
    var InternalDraw = inject(function( device, components ) {
        
        // clear the canvas
        device.clearRect( 0, 0, DEFAULTS['HGRAPH_WIDTH'], DEFAULTS['HGRAPH_HEIGHT'] );
        
        for( var i = 0; i < components.length; i++ )
            components[i].Draw( );
    
    }, [ _device, _components ] );
    
    // InternalUpdate
    // calls any position/size adjustments especially during animation loops
    var InternalUpdate = inject(function( InternalDraw ) { 
        
        return InternalDraw( );
        
    }, [ InternalDraw ]);
     
    // InternalInitialize
    // 
    var InternalInitialize = inject(function( uid, components, device, mouse, transform ) {
        
        for( var i = 0; i < components.length; i++ )
            components[i].Initialize( uid, device, transform, mouse );
            
    }, [ _uid, _components, _device, _mouse, _transform ] );
    
    // MouseMove
    // event callback that is fired every time the mouse is moved while being over the
    // UI layer. If the mouse is down, it will update the transform object's position
    var MouseMove = inject(function( mouse, container, transform, InternalUpdate, evt ) {
        
        if( !evt )
            return false;
        
        // update the mouse position
        mouse.x = evt.pageX - container.offsetWidth;
        mouse.y = evt.pageY - container.offsetHeight;
        
        // if dragging, update the position too
        if( mouse.isDown ) {
            transform.position.x = mouse.x + ( this.transform.size.width * 0.5 );
            transform.position.y = mouse.y + ( this.transform.size.height * 0.5 );
        }
    
        return InternalUpdate( );
        
    }, [ _mouse, _container, _transform, InternalUpdate ] );
    
    // MouseDown
    // callback function for mousedown events on the UI layer
    var MouseDown = inject(function( mouse ) {
        // the mouse is down, make sure the object knows it
        mouse.isDown = true;  
        // look on the entire document for mouse up events
        jQuery(document).bind( 'mouseup', MouseUp );
    }, [ _mouse, MouseUp ]);
    
    // MouseUp
    // the mouse up event that is called on the UI layer of the UI layer
    var MouseUp = inject(function ( mouse ) {
        // toggle the mouse as no longer being down
        mouse.isDown = false; 
        // unbind mouse up - no longer needed
        jQuery(document).unbind( 'mouseup' );
    }, [ _mouse ]);
        
    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
        // add the ui div(layer) to the container
        _container.appendChild( _uiLayer );
    } catch( e ) {
        this.ready = false;
        return console.error('hGraph was unable to create a graph in the container');
    }
    
    jQuery( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] );
        
    jQuery( _uiLayer )
        .attr( 'hgraph-layer', 'ui' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp );
    
    
    // flag the graph as being ready for initialization
    this.ready = true;
    
    this.invokeQueue = [ InternalUpdate, InternalInitialize ];
};

hGraph.Graph.prototype = {
    // basic graph properties
    constructor : hGraph.graph,     
    
    // Initialize
    // if the graph is ready, this initialization function will
    // loop through the graph's 'invokeQueue' which is a list of 
    // initialization functions
    Initialize : function( ) { 
        if( !this.ready )
            return false;
            
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
*/
//})( );




// hGraph.Graph.ComponentFacory
// creates a constructor that will have a prototype with the 
// properies modified by the factory function being passed as 
// the parameter
hGraph.Graph.ComponentFacory = function( factory ) {

    // create the public scope object 
    var publicScope = { };
        
    // allow the factory function to change the public scope (by reference)
    factory( publicScope );
    
    // create the constructor for this component
    var Component = hasOwn.call( factory, 'constructor') ? factory['constructor'] : function( ) { };
    
    Component.prototype = {
        
        Initialize : function( locals ) {
            // all components are not ready till proven otherwise
            this.ready = false;            
            // save a reference to the local variables on this object
            this.locals = locals;
            // if we got a uid in the locals hash, we are good to go
            if( this.locals['uid'] )
                this.ready = true;
        },
        
        // placeholder functions that are overridden during extension
        Draw : function( ) { },
        Update : function( ) { }
        
    };
    
    // extend the component's prototype with the modified scope
    jQuery.extend( Component.prototype, publicScope );
    
    // return the constructor to be used
    return Component;
    
};

// hGraph.Graph.Transform
// the transform component

// TransformFactory
function TransformFactory( publicScope ) {
    
    publicScope.Move = function( xpos, ypos ) {
        this.position.x = xpos;
        this.position.y = ypos;
    };
    
};

// TransformFactory (constructor)
// this function will be used as the Transform object constructor. in order
// to populate some of the initial characteristics to starting values
TransformFactory['constructor'] = function( ) {

    // initialize everything with starting values
    this.size = { width : DEFAULTS['HGRAPH_WIDTH'], height : DEFAULTS['HGRAPH_HEIGHT'] };
    this.position = { x : ( this.size.width * 0.5 ), y : ( this.size.height * 0.5 ) };
    this.scale = 1;
    this.rotation = 0;
    
};

// create the constructor from the component factory
hGraph.Graph.Transform = hGraph.Graph.ComponentFacory( TransformFactory );

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class. Will be used as a
// "Component" during update and draw calls

// RingFacotry
function RingFactory( publicScope ) {
    
    publicScope.Draw = function( ) {
        if( !this.ready )
            return false;
        
        var transform = this.locals.GetComponent('transform'),
            device = this.locals.device;
        
        if( !transform )
            return console.error('was unable to access the transform component');
        
        var position = transform.position,
            scale = transform.scale,
            outerRadius = this.outerRadius * scale,
            innerRadius = this.innerRadius * scale;
            
        // draw the outer circle first
        device.beginPath( );
        device.arc( position.x, position.y, outerRadius, 0, Math.PI * 20 );
        device.fillStyle = "#333";
        device.fill( );
        
        // draw the outer circle first
        device.beginPath( );
        device.arc( position.x, position.y, innerRadius, 0, Math.PI * 20 );
        device.fillStyle = "#fff";
        device.fill( );
        
        
    };

};

RingFactory['constructor'] = function( ) {
    this.innerRadius = DEFAULTS['HGRAPH_INNER_RADIUS'];  
    this.outerRadius = DEFAULTS['HGRAPH_OUTER_RADIUS'];
};

// create the Ring constructor from the component factory
hGraph.Graph.Ring = hGraph.Graph.ComponentFacory( RingFactory );

// ----------------------------------------
// hGraph bootstrapping

// hCreateGraph
// creates the hgraph inside the container parameter
function hCreateGraph( container ){
    var uid = createUID( );
    hGraphInstances[uid] = new hGraph.Graph({ uid : uid, container : container });
};

// hGraphInit
// called once the root element has been found during the bootstrapping
// function call. takes care of populating the graphs on the page
function hGraphInit( ) {

    // try using the bootstrap selections to find elements
    jQuery( DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'] ).each(function(indx, trigger) {
        var matches = jQuery("["+trigger+"]");
        // loop through the elements to create graphs inside them
        for( var i = 0; i < matches.length; i++ )
            hCreateGraph( matches[i] );
    });
    for( var uid in hGraphInstances )
        hGraphInstances[uid].Initialize( );
};

// hGraphBootStrap
// document ready callback. will search the page for an element with either
// a 'data-hgraph-app' or 'hgraph-app' attribute and save it as the root element
function hGraphBootStrap( ) {
    jQuery( DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] ).each(function(indx, trigger) {
        // try to find an element with the application bootstrap attribute
        var matches = jQuery("["+trigger+"]");
        if( matches.length > 0 )
            hRootElement = matches.first( );
    });
    // if the 'hgraph-app' attribute was found, we can initialize
    if( hRootElement !== false )
        return hGraphInit( );
};

jQuery(document).ready( hGraphBootStrap );

})( window );
