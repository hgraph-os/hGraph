/* ******************************************************* *
 * Mixer.js - Mixer class definition for hGraph's hMixer   *
 * http://hgraph.org/hMixer                                *
 * Author(s):                                              *
 *  - Danny Hadley <danny@goinvo.com>                      *
 * License:                                                *
 *  Copyright 2013, Involution Studios <http://goinvo.com> *
 *  under the Apache License, Version 2.0                  *
 * ******************************************************* */
(function(){

    "use strict";
    
    var Mixer,       // Mixer object       (public)
        Metric,      // Metric class       (private)
        Utils, U,    // Utility functions  (private)
        Defaults, D, // Default settings   (private)s

        /* 
         * private (h) variable definitions
        */
        hPrepped    = false, // Mixer object prep state
        hMetrics    = [ ],   // Metric object array
        hRenderZone = null;  // The container where metrics are to be dumped


////////////////////////////////////////////   
// Default storage and it's shortcut
//
Defaults = D = {
    safe_range       : [50, 80],
    total_range      : [0, 100],
    weight           : 1,
    svg_element      : { width : 800, height : 250 },
    svg_layers       : ["ui", "data"],
    chart_dimensions : {
        left   : 75,
        top    : 40,
        width  : 650,
        height : 170
    },
    svg_cover : {
        "fill"   : "rgba(0,0,0,0.0)",
        "x"      : 0,
        "y"      : 0,
        "width"  : 800,
        "height" : 250
    },
    svg_text : {
        "fill"           : "#9d9f9f",
        "font-family"    : "'Droid Serif',serif",
        "font-size"      : "12px",
        "pointer-events" : "none"
    },
    svg_axis : { 
        "stroke" : "#9d9f9f"
    },
    range_rect : {
        "fill"   : "#bdcb9e",
        "y"      : 40,
        "height" : 169,
        "cursor" : "move"
    },
    bound_outer_circle : {
        "r"      : 9,
        "fill"   : "#fff",
        "cx"     : 0,
        "cy"     : 0,
        "filter" : "url(#shadow)"
    },
    bound_inner_circle : {
        "r"    : 5,
        "fill" : "#80994f",
        "cy"   : 0,
        "cx"   : 0
    }
};

////////////////////////////////////////////   
// Utility object and it's shortcut
//
Utils = U = {
    
    /* Utils.domReady
     *
     * Attatches a callback passed in as a 
     * parameter to the DOM as an onReady  
     *
     * Inspired by jQuery
     * @param {function} callback The function to be called on load
    */
    domReady : (function ( window ) {
        
        var _isAddE   = (document.addEventListener) ? true : false, // addEventListener capable?
            _isAttE   = (document.attachEvent) ? true : false,      // attachEvent capable?
            _document = window.document,                            // local copy of the document
            _callback = function () { },                            // empty callback 
            _isLoaded = (_document.readyState !== "loading"),       // initial ready check
            _hasFired = false,                                      // keep track if it has been fired
            _onReady  = function () {                               // internal ready call
     
                /* dont proceed if it has been fired */
                if( _hasFired ){ return; }
                
                _hasFired = true;
                
                _callback();
            },
            _domReady = function ( callback ) { 
                
                /* if the page is already loaded, forget it */
                if( _isLoaded ) { return; }
                
                /* save the passed callback if it is a function */
                _callback = (typeof callback === "function") ? callback : _callback; 
            };
    
        if( _isAddE ) {
			document.addEventListener( "DOMContentLoaded", _onReady, false );
			window.addEventListener( "load", _onReady, false );
        } else if( _isAttE ){
            document.attachEvent( "onreadystatechange", _onReady );
            window.attachEvent( "onload", _onReady );
        }     
    
        return _domReady;
        
    })( window ),
    
    /* Utils.uid
     *
     * Generates a unique ID for objects that
     * need to be placed in hash tables
    */
    uid : (function () {
        var i = 0;
        return function () { return ++i; };
    })(),
    
    /* U.a 
     *
     * Set attribute shortcut that will set the 
     * named property to the value and allow return 
     * chaining
     * @param {string} name The attribute name 
     * @param {string} value What the attibute will be set to
    */
    a : function (name, value) {
        if( !this.setAttribute ){ return false; }
        this.setAttribute(name,value);    
        return U.a;
    },
    
    /* U.type
     * 
     * returns a more specific object type string
     * than the default "typeof"
     * @param {object} obj The object to be typed
    */
    type : (function () {
        var _ts    = Object.prototype.toString,
            _types = {
                "[object Array]"    : "array",
                "[object Function]" : "function",
                "[object Object]"   : "object",
                "[object Number]"   : "number",
                "[object String]"   : "string"
            },
            _type = function (obj) {
                var str = _ts.call(obj);
                return _types[str] || str;
            };
        
        return _type;
    })( ),
    
    /* U.error
     * 
     * Writes out to the console a message
     * @param {string} err The error message
     * @param {string} [style] The type of log to do
    */
    error : (function () {
        
        var _console = window.console || { },
            _cerror  = _console.error || function (err) { },
            _log     = _console.log   || function (err) { },
            _error   = function (err, style) {
                
                if(!style || style === "error"){ 
                    _cerror.call(_console, err);
                    return false; 
                }
                
                switch (style) {
                    case "log" : 
                        _log.call(_console, err);
                        break;
                    case "dir" :
                        _dir.call(_console, err);
                        break;
                    default :
                        _log.call(_console, err);
                        break;
                }
                
                return true;
            };
        
        return _error;
        
    })( ),
    
    
    /* makeTransformString
    *
    * A shortcut for generating transform strings 
    * for use with the bounds
    * @param {int} left The desired left position
    * @param {int} [top] Possible desired top position
    */    
    makeTransformString : (function () {
        
        var _hHeight = (D.chart_dimensions.height * 0.5),
            _hYPos   = _hHeight + D.chart_dimensions.top,
            _mtsf    = function (left, top) {
                return "translate(" + left + "," + (top || _hYPos) + ")";
            };
            
        return _mtsf;
        
    })()

};

U.e   = U.error;               //shortcut for error
U.mts = U.makeTransformString; //shortcut for makeTransformString



////////////////////////////////////////////   
// Metric object definitions 
//

/* @constructor */
Metric = function ( opts ) {
    return new Metric.prototype.rig( opts ); // self-instantiating constuctor 
};

Metric.layerPrep = (function () {
    
    var ui,   // ui layer function   (returned)
        data, // data layer function (returned)
        
        /* interaction definitions */
        _startDrag, // mouse downs 
        _doDrag,    // mouse moves
        _endDrag,   // mouse ups
        
        /* handle dependent function */
        _moveRange,      // moves the whole range
        _moveLeftBound,  // moves the left bound circle
        _moveRightBound, // moves the right bound
        
        /* helper function for the transform property */
        _makeTransformString, _mts, // shortcut too 
        
        /* interaction properties */
        _interactionState = { };
        

/* _startDrag
 *
 * Prepares the document to handle
 * mouse move events 
*/    
_startDrag = function ( evt ) {
    d3.select(document).on("mousemove", _doDrag).on("mouseup", _endDrag);
};


/* _moveRange
 * 
 * The drag function that is called on mouse  
 * move after mouse down the on the main 
 * range rectangle 
 * @param {number} left The left position relative to the chart
*/
_moveRange = function (left) {
    var xs       = this.ref.xscale,
        leftb    = this.pub.saferange[0],
        rightb   = this.pub.saferange[1],
        width    = rightb - leftb,
        xpos     = xs.invert(left),
        newRight = xpos + (width * 0.5),
        newLeft  = xpos - (width * 0.5);
        
    /* catch the boundary issues */
    if( newLeft < this.pub.totalrange[0] ){
        newLeft  = 0;
        newRight = width;
    } else if ( newRight > this.pub.totalrange[1] ){
        newRight = this.pub.totalrange[1];
        newLeft  = newRight - width;
    }
        
    this.pub.saferange = [newLeft, newRight];
};


/* _moveLeftBound
 * 
 * The drag function that is called on mouse  
 * move after mouse down the on the left bound
 * @param {number} left The left position relative to the chart
*/
_moveLeftBound = function ( left ) {
    var xs  = this.ref.xscale,
        lp  = xs.invert(left),
        rb  = this.pub.saferange[1],
        max = this.pub.totalrange[0]; 
    
    if( lp < max ) { lp = max; }
    if( lp > rb ) { lp = rb; }
    
    this.pub.saferange[0] = lp;
};

/* _moveRightBound
 * 
 * The drag function that is called on mouse  
 * move after mouse down the on the right bound
 * @param {number} left The left position relative to the chart
*/
_moveRightBound = function ( left ) {
    var xs  = this.ref.xscale,
        rp  = xs.invert(left),
        lb  = this.pub.saferange[0],
        max = this.pub.totalrange[1];
    
    if( rp > max ) { rp = max; }
    if( rp < lb ) { rp = lb; }
    
    this.pub.saferange[1] = rp;
};

/* _doDrag
 *
 * Handles mouse movements
*/  
_doDrag = function ( evt ) {  
    
    /* if the listener got fired without an event - give up */
    if ( !d3.event ){ return false; }
    
    var metric       = _interactionState.metric,
        activeE      = _interactionState.activeE,
        mouseLeft    = d3.event.pageX,
        relativeLeft = mouseLeft - metric.dom.container.offsetLeft;
    
    switch ( activeE ) {
        case "lb" :
            _moveLeftBound.call( metric, relativeLeft ); 
            break;
        case "rb" : 
            _moveRightBound.call( metric, relativeLeft );
            break;
        case "rr" : 
            _moveRange.call( metric, relativeLeft );
            break;  
        default : 
            break;
    };
    
    return metric.redraw( );
};

/* _doDrag
 *
 * Releases previously bound listeners
*/  
_endDrag = function ( evt ) {
    d3.select(document).on("mousemove", null).on("mouseup", null); // remove event listeners
    _interactionState = { };                                       // clear out the state 
};
        
/* Metric.layerPrep.ui
 *
 * Prepares the metric's ui layer with 
 * the axis
*/
ui = function ( layer ) {  
    var xs = this.ref.xscale,
        ys = this.ref.yscale,
        xt = xs.ticks(10),
        yt = ys.ticks(3);
    
    layer
        .selectAll("text.xticks")
        .data(xt).enter().append("text")
        .text(function (d, i) { return d; })
        .attr("x", function(d, i) { return xs(d); })
        .attr("text-anchor", "middle")
        .attr(D.svg_text)
        .attr("y", D.chart_dimensions.top + D.chart_dimensions.height + 15);
        
    layer
        .selectAll("text.yticks")
        .data(yt).enter().append("text")
        .text(function (d, i) { return d; })
        .attr(D.svg_text)
        .attr("x", D.chart_dimensions.left + D.chart_dimensions.width + 4)
        .attr("y", function (d, i) { return ys(d); });
        
    layer
        .append("line")
        .attr("x1", D.chart_dimensions.left)
        .attr("x2", D.chart_dimensions.left + D.chart_dimensions.width)
        .attr("y1", (D.chart_dimensions.top + D.chart_dimensions.height) - 0.5)
        .attr("y2", (D.chart_dimensions.top + D.chart_dimensions.height) - 0.5)
        .attr(D.svg_axis);
        
    layer
        .append("line")
        .attr("x1", (D.chart_dimensions.left + D.chart_dimensions.width) - 0.5)
        .attr("x2", (D.chart_dimensions.left + D.chart_dimensions.width) - 0.5)
        .attr("y1", D.chart_dimensions.top)
        .attr("y2", D.chart_dimensions.top + D.chart_dimensions.height)
        .attr(D.svg_axis);
        
    layer.append("rect")
        .attr(D.svg_cover);
};

/* Metric.layerPrep.data
 *
 * Prepares the metric's data layer for
 * interation and fun times
*/
data = function ( layer ) {
    var metric = this,
        dom    = metric.dom,
        rangeRect, leftBound, rightBound;
    
    rangeRect = layer.append("rect")
                    .attr(D.range_rect)
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "rr";   // we are using the range rect
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );               // begin registering events  
                    });
                    
    leftBound  = layer.append("g")
                    .attr("data-name","left-node")
                    .attr("cursor","pointer")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "lb";   // we are using the range rect
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );               // begin registering events 
                    });
                    
    rightBound = layer.append("g")
                    .attr("data-name","right-node")
                    .attr("cursor","pointer")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "rb";   // we are using the range rect
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );               // begin registering events 
                    });
    
    leftBound.append("circle").attr(D.bound_outer_circle);
    rightBound.append("circle").attr(D.bound_outer_circle);
    
    leftBound.append("circle").attr(D.bound_inner_circle);
    rightBound.append("circle").attr(D.bound_inner_circle);
      
    dom.rangeRect = rangeRect;  // save the range rectangle
    dom.leftNode  = leftBound;  // save the left bound
    dom.rightNode = rightBound; // save the right bound 
};

/* dump the layer prepping functions back out */
return { ui : ui, data : data };

})( );

Metric.prototype = {
    constructor : Metric,
    version     : "1.0",
    
    /* metric.rig
     *
     * Constructs a new metric object
     * @param {object} opts The options to build a metric with
    */
    rig : function ( opts ) {
    
        /* the object that will keep references to values, names.. etc */
        this.pub = { 
            name       : opts.name || "N/A",
            saferange  : (opts.features && opts.features.saferange) ? opts.features.saferange : D.safe_range,
            totalrange : (opts.features && opts.features.totalrange) ? opts.features.totalrange : D.total_range,
            weight     : (opts.features && opts.features.weight) ? opts.features.weight : D.weight
        };
        
        var w = D.chart_dimensions.width,
            l = D.chart_dimensions.left,
            t = D.chart_dimensions.top,
            h = D.chart_dimensions.height;
        
        /* an object reference to store things like scales and etc.. */
        this.ref = {
            xscale : d3.scale.linear().domain(this.pub.totalrange).range([l, l + w]), // the x scale            
            yscale : d3.scale.linear().domain([0,100]).range([h+t,t])                 // the y scale   
        };
        
        this.uid = U.uid(); // give this metric a unique identifier
        this.dom = { };     // save room for the metric's dom elements
        
        /* finish by rendering up the article and svg */
        this.render( );
    },
    
    
    /* metric.render
     *
     * creates the necessary DOM elements 
    */
    render : function ( ) {
        var container = document.createElement("article"),
            context   = d3.select(container).append("svg"),
            dom       = this.dom,
            layers    = { }, i = 0, layer, name;
    
        U.a.call(container,"class","metric cf middle"); // set the metric container's class
        context.attr(D['svg_element']);                 // set the default properties of the svg element
        
        /* make SVG groups that will represent layers */
        for(i; name = D.svg_layers[i], i < D.svg_layers.length; i++){
            layer = context.append("g").attr("data-name", name);
            
            /* if there is a prep function defined for this layer */
            if( Metric.layerPrep[name] && U.type(Metric.layerPrep[name]) === "function" ){
                Metric.layerPrep[name].call(this, layer);
            }
            
            layers[name] = layer;
        }
                
        
        dom.container   = container; // save the html container
        dom.svg_element = context;   // save the svg element
        dom.layers      = layers;    // save the "g" layers
        
        return this.redraw( );
    },
    
    /* metric.redraw
     *
     * called after the metric's range has changed
    */
    redraw : function () {
        var xs        = this.ref.xscale,
            ys        = this.ref.yscale,
            dom       = this.dom,
            rect      = dom.rangeRect,
            leftNode  = dom.leftNode,
            rightNode = dom.rightNode,
            leftb     = xs( this.pub.saferange[0] ),
            rightb    = xs( this.pub.saferange[1] ),
            width     = rightb - leftb;
        
        rect
            .attr("x", leftb)
            .attr("width", width);
        
        leftNode
            .attr("transform", U.mts(leftb) );
            
        rightNode
            .attr("transform", U.mts(rightb) ); 
        
    },
    
    /* metric.strip
     *
     * returns a metric object without access
     * to the DOM elements or it's functions 
    */
    strip : function () {
        return this.pub;
    }
};

/* allows the use of rig as the constructor */
Metric.prototype.rig.prototype = Metric.prototype;



////////////////////////////////////////////   
// Mixer object definitions 
//
Mixer = (function () {
    
    var /* private objects */
        __mixer,                // The public object to be returned
        __ajaxCallback = false, // In case the ajax method is being used
    
        /* private functions */
        _prepMixer,       // Initialization function
        _populateMetrics, // Metric creation function 
        _setOptions,      // Optional option setting
        _svgDefs;         // creation of handy SVG styles


/* _svgDefs
 * 
 * Set up an SVG element on the page to contain all
 * the filter effects and definitions needed
*/
_svgDefs = function ( ) {
    
    var hider    = document.createElement("div"),
        svg      = d3.select(hider).append("svg"),
        defs     = svg.append("defs"),
        filter   = defs.append("filter"),
        offset   = filter.append("feOffset"),
        gaussian = filter.append("feGaussianBlur"),
        flood    = filter.append("feFlood"),
        compin   = filter.append("feComposite"),
        compout  = filter.append("feComposite");
        
    svg.attr({
        "width"  : "0px",
        "height" : "0px" 
    });
    
    filter.attr("id", "shadow");
    offset.attr({
        "dx" : "0", 
        "dy" : "0" 
    });
    gaussian.attr({
        "stdDeviation" : "1.5",
        "result"       : "offset-blur"
    });
    flood.attr({
        "flood-color"   : "black",
        "flood-opacity" : "0.55",
        "result"        : "color"
    });
    compin.attr({
        "operator" : "in",
        "in"       : "color",
        "in2"      : "offset-blur",
        "result"   : "shadow"
    });
    compout.attr({
        "operator" : "over",
        "in"       : "SourceGraphic",
        "in2"      : "shadow"
    });
    
    
    U.a.call(hider,"class","no-vis");
    
    document.body.appendChild( hider );
};

/* _setOptions
 * 
 * Set misc options
 * @param {object} options Object with options 
*/
_setOptions = function ( options ) {    

    D.range_rect.fill = options.range_fill || D.range_rect.fill; // range box color
    D.svg_text.fill   = options.text_fill || D.svg_text.fill;    // text color
    D.safe_range      = options.safe_range || D.safe_range;      // safe range 
    D.total_range     = options.total_range || D.total_range;    // total range 
    
    
    /* remove text selection (highlighting) */
    if( options.allowTextSelection === false ){
        document.onselectstart = function (evt) { evt.preventDefault && evt.preventDefault(); return false; };
    }
};

/* _prepMixer
 * 
 * Gets rendering zone, populates metrics
 * @param {array} metricData An array of metric information 
*/
_populateMetrics = function ( metricData ) {    
    
    if( U.type(metricData) !== "array" ){ 
        return U.e("Improper data format; must be of type \"array\""); 
    }
    
    var i, metric;
    
    for(i = 0; i < metricData.length; i++){
        
        /* build a new metric */
        metric = Metric( metricData[i] );
        
        /* render the new metric */
        hRenderZone.appendChild( metric.dom.container );
        
        /* push the stripped metric into the hMetrics array */
        hMetrics.push( metric.strip() );
    }
    
    if( __ajaxCallback && U.type( __ajaxCallback ) === "function" ){
        __ajaxCallback( );
    }
    
};


/* _prepMixer
 * 
 * Gets rendering zone, populates metrics
 * @param {array|object|boolean} metricList
*/
_prepMixer = function ( metricList ) {

    /* do not prep the mixer more than once */
    hPrepped = true;
    
    /* add the svg definitions to the page */
    _svgDefs( );
    
    /* find the context to render metrics inside */
    hRenderZone = document.getElementById("metrics")
                    || document.getElementById("context")
                    || document.getElementById("hMixer")
                    || document.body.appendChild(document.createElement("section"));
    
    /* apply or re-define some attributes */
    U.a.call(hRenderZone,"class","f metrics cf").call(hRenderZone,"id","metrics");
    
    if( metricList && metricList.length >= 0 && U.type(metricList) == "array"){
        /* use the array and get the list populated */
        _populateMetrics( metricList );
    } else if( metricList && metricList.url ){
        /* if there was a callback sent in as well */
        if( metricList.callback ){
            __ajaxCallback = metricList.callback; 
        }
        /* make the request to the url */
        d3.json( metricList.url, _populateMetrics );   
    }
    
    return (metricList === false) ? U.e("Mixer.init must be called with an array or an object") : true;
};

__mixer = {  
     
    version : "1.0", 
    
    /* Mixer.init
     * 
     * Prepare the mixer object 
     * @param {array|object} [metricList] Object with a url for ajax, or an array
     * @param {object} [opts] Options for the hMixer page
    */
    init : function ( metricList, opts ) {
        if( opts && U.type(opts) === "object" ){ _setOptions( opts ); }

        return (hPrepped) ? U.e("Mixer was already prepped.") : _prepMixer( metricList || false );
    },
    
    /* Mixer.getMetric
     * 
     * Returns either the whole list of metrics,
     * or the one with the name of the argument
     * @param {string} [name] The name of the desired metric
    */
    getMetric : function (name) {
        if( !name || hMetrics.length === 0) { return hMetrics; }  
        
        var i, metric, mname;
        
        for(i = 0; i < hMetrics.length; i++){
            metric = hMetrics[i];
            mname  = metric.name;
            
            if(mname.toLowerCase() === name.toLowerCase()){ return metric; }
        }
        
        return false;
    }
};

return __mixer;
    
})();

    
    
window.Mixer = Mixer;          // Show the Mixer object to the outside
window.Entry = Utils.domReady; // Let the domReady function be used

})();


