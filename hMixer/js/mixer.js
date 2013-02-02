/* ******************************************************* *
 * Mixer.js - Mixer class definition for hGraph's hMixer   *
 * http://code.goinvo.com/hMixer/                          *
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
        
    })( )
};

U.e = U.error; //shortcut for error

////////////////////////////////////////////   
// Default storage and it's shortcut
//
Defaults = D = {
    svg_element      : { width : 800, height : 250 },
    svg_layers       : ["ui", "data"],
    chart_dimensions : {
        left   : 75,
        top    : 40,
        width  : 650,
        height : 170
    },
    svg_text : {
        "fill"        : "#9d9f9f",
        "font-family" : "'Droid Serif',serif",
        "font-size"   : "12px"    
    },
    svg_axis : { 
        "stroke" : "#9d9f9f"
    }
};


////////////////////////////////////////////   
// Metric object definitions 
//

/* @constructor */
Metric = function ( opts ) {
    return new Metric.prototype.rig( opts ); // self-instantiating constuctor 
};

Metric.layerPrep = {
    
    /* Metric.layerPrep.ui
     *
     * Prepares the metric's ui layer with 
     * the axis
    */
    ui : function ( layer ) {  
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
    },
    
    /* Metric.layerPrep.data
     *
     * Prepares the metric's data layer for
     * interation and fun times
    */
    data : function ( layer ) {
        
    }
};

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
            saferange  : (opts.features && opts.features.saferange) ? opts.features.saferange : [0,100],
            totalrange : (opts.features && opts.features.totalrange) ? opts.features.totalrange : [0,100],
            weight     : (opts.features && opts.features.weight) ? opts.features.weight : 1
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
            
        
        
        this.dom = {
            container   : container,
            svg_element : context,
            layers      : layers
        };
    },
    
    /* metric.strip
     *
     * returns a metric object without access
     * to the DOM elements or it's functions 
    */
    strip : function () {
        return this.pub;
    },
};

/* allows the use of rig as the constructor */
Metric.prototype.rig.prototype = Metric.prototype;



////////////////////////////////////////////   
// Mixer object definitions 
//
Mixer = (function () {
    
    var /* private objects */
        __mixer,      // The public object to be returned
    
        /* private functions */
        _prepMixer,       // Initialization function
        _populateMetrics; // Metric creation function 


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
    
};


/* _prepMixer
 * 
 * Gets rendering zone, populates metrics
 * @param {array|object|boolean} metricList
*/
_prepMixer = function ( metricList ) {

    /* do not prep the mixer more than once */
    hPrepped = true;
    
    /* find the context to render metrics inside */
    hRenderZone = document.getElementById("metrics")
                    || document.getElementById("context")
                    || document.getElementById("hMixer")
                    || document.body.appendChild(document.createElement("section"));
    
    /* apply or re-define some attributes */
    U.a.call(hRenderZone,"class","f metrics cf").call(hRenderZone,"id","metrics");
    
    if( metricList && metricList.length >= 0 && U.type(metricList) == "array"){
    
        _populateMetrics( metricList );
    
    } else if( metricList && metricList.url ){

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
    */
    init : function ( metricList ) {
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

    
    
window.Mixer = Mixer;          // Show the mixer to the outside
window.Entry = Utils.domReady; // Let the domReady function be used

})();


