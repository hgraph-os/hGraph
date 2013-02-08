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
        hPrepped      = false, // Mixer object prep state
        hMetrics      = [ ],   // Metric object array
        hOriginalData = false,
        hRenderZone   = null,  // The container where metrics are to be dumped
        hSubmitForm   = null,  // The form that will be submitted
        hGenderIndex  = 0,     // a gender number defining male of female
        hMetricIndex  = 0;


////////////////////////////////////////////   
// Default storage and it's shortcut
//
Defaults = D = {
    boundary_flags   : [false, false],
    form_class       : "form.submit-form",
    healthy_range    : [50, 80],
    total_range      : [0, 100],
    weight           : 1,
    fade_delay       : 100,
    unitlabel        : "mg/dL",
    svg_element      : { width : 900, height : 175 },
    svg_layers       : ["ui", "data"],
    block            : {"class" : "interaction-lock"},
    chart_dimensions : {
        left   : 225,
        top    : 40,
        width  : 550,
        height : 95
    },
    svg_cover : {
        "fill"   : "rgba(0,0,0,0.0)",
        "x"      : 0,
        "y"      : 0,
        "width"  : 900,
        "height" : 175
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
        "height" : 94,
        "cursor" : "move"
    },
    bound_text : {
        "fill"           : "#404141",
        "font-family"    : "'Droid Serif',serif",
        "font-size"      : "12px",
        "pointer-events" : "none",
        "text-anchor"    : "middle",
        "y"              : 30
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
    },
    title_text : {
        "x"              : 200,
        "y"              : 134,
        "fill"           : "#404141",
        "font-family"    : "'Droid Serif',serif",
        "font-size"      : "32px",
        "pointer-events" : "none",
        "text-anchor"    : "end"
    },
    unit_text : {
        "x"              : 200,
        "y"              : 150,
        "fill"           : "#9d9f9f",
        "font-family"    : "'Droid Serif',serif",
        "font-size"      : "12px",
        "pointer-events" : "none",
        "text-anchor"    : "end"
    },
    weight_bar : {
        "x1"     : 837.5,
        "x2"     : 837.5,
        "y1"     : 40,
        "y2"     : 135,
        "stroke" : "#c0c3c2"
    },
    weight_bounds : {
        "r"    : 2,
        "fill" : "#c0c3c2",
        "cx"   : 837.5  
    },
    curve_path : {
        "stroke-width" : 3,
        "stroke"       : "#6c6e6d",
        "fill"         : "none"
    },
    curve_bubble : {
        "fill" : "#4c4d4d",
        "cy"   : 0,
        "cx"   : 0,
        "r"    : 10
    },
    curve_text : {
        "fill"           : "#fff",
        "font-family"    : "'Droid Serif',serif",
        "font-size"      : "10px",
        "pointer-events" : "none",
        "text-anchor"    : "middle",
        "x"              : 0,
        "y"              : 5
    },
    daily_inputbox : {
        "class" : "daily-input t",
        "type"  : "text"
    },
    input_line : {
        "stroke"           : "#9d9f9f",
        "stroke-dasharray" : "3,3"
    },
    input_score_circle : {
        "fill" : "#e16851",
        "cy"   : 0,
        "cx"   : 0,
        "r"    : 10
    },
    health_colors : {
        "healthy"   : "#585a5a",
        "unhealthy" : "#e16851"
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
                        _log.call(_console, "[log: " + err + "]");
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
                return "translate(" + left + "," + ( (U.type(top) == "number") ? top : _hYPos) + ")";
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
        
        /* "generic" interaction definitions */
        _startDrag,       // mouse downs 
        _doDrag,          // mouse moves
        _endDrag,         // mouse ups
        _dailyKeymanager, // keypress for handling the daily inputs
        _dailySubmit, 
        
        /* "handle" dependent functions */
        _moveRange,      // moves the whole range
        _moveLeftBound,  // moves the left bound circle
        _moveRightBound, // moves the right bound
        _moveWeight,     // moves the weight
        _movePoint,      // moves individual points 
        _scrubPath,      // updates the scubbber bubble
        
        /* helper functions */
        _whipeInteractionState,
        _drawInitialPoints,
        
        /* click function -> adds scale curve points */
        _addScalePoint,
        
        /* interaction properties */
        _interactionState = { 
            metric          : null, 
            activeE         : null, 
            hasMoved        : false, 
            initialDistance : null,
            pointIndex      : null,
            isFocused       : false
        },
        
        /* fade out for the scrubber */
        _fadeOutTimeout = null;
    
    
/* _startDrag
 *
 * Prepares the document to handle "mousemove" events 
*/    
_startDrag = function ( evt ) {
    
    var metric           = _interactionState.metric,
        xscale           = metric.ref.xscale,
        initialRelativeX = d3.event.pageX - metric.dom.container.offsetLeft,
        initialLeft      = xscale( metric.pub.healthyrange[0] ),
        initialRight     = xscale( metric.pub.healthyrange[1] ),
        initialWidth     = initialRight - initialLeft,
        initialMiddle    = initialLeft + (initialWidth * 0.5),
        initialDistance  = initialMiddle - initialRelativeX;
    
    U.e("starting a drag interaction on: (" + metric.pub.name + ")", "log");
    
    /* save this initial distance */
    _interactionState.initialDistance = initialDistance;
    /* reset the hasMoved - nothing has happened yet... */
    _interactionState.hasMoved = false;

    d3.select(document).on("mousemove", _doDrag).on("mouseup", _endDrag);
};

/* _scrubPath
 * 
 * Mouse move event for path scrubber 
 * @param {object} evt The d3.event that was fired on move
*/
_scrubPath = function ( evt ) { 
    if( _interactionState.hasMoved ){ return false; }
    
    var metric     = _interactionState.metric,
        yscale     = metric.ref.yscale,
        xscale     = metric.ref.xscale,
        bubble     = metric.dom.curveBubble,
        rLeft      = evt.pageX - metric.dom.container.offsetLeft,
        closePoint = metric.getScoreAlongCurve( rLeft ),
        scrubVal;

    /* if no close point was found */
    if( !closePoint ) { return; }
    
    /* get the real values of these coordinates */
    scrubVal = {
        y : yscale.invert( closePoint.y ).toFixed(0),
        x : xscale.invert( rLeft ).toFixed(0)
    };
    
    /* update the bubble */
    bubble
        .attr("transform", U.mts(closePoint.x, closePoint.y) )
        .transition().duration(20).attr("opacity", 1.0);
    
    bubble
        .selectAll("text")
        .text( scrubVal.y );
    
    clearTimeout(_fadeOutTimeout);
    _fadeOutTimeout = setTimeout(function () {
        
        bubble
            .transition().duration(100).attr("opacity", 0.0);
            
    }, 1000);
    
};

/* _addScalePoint
 * 
 * Function for adding points to the scale path
 * @param {number} rmX The desired initial left position
 * @param {number} rmY The desired initial top position
*/
_addScalePoint = function ( rmX, rmY ){
    /* if there was some sort of drag, forget about it */
    if( _interactionState.hasMoved ){ return; }
    
    var metric = _interactionState.metric,
        points = metric.ref.points,
        layer  = metric.dom.pointGroup,
        d      = D.chart_dimensions,
        point, dpoint; 
    
    point = layer
                .append("g")
                .attr("data-point", points.length)
                .attr("data-uid", U.uid() )
                .attr("cursor", "pointer")
                .on("mousedown", function ( ) {
                    var pIndx =  d3.select(this).attr('data-point');
                    
                    _interactionState.activeE    = "point";   // we are using the range rect
                    _interactionState.metric     = metric;    // save the metric being acted upon
                    _interactionState.pointIndex = pIndx;     // save the point intex
                    
                    return _startDrag( );                     // begin registering events 
                }).attr("opacity", "0.0");
                 
    point
        .append("circle")
        .attr(D.bound_outer_circle); 
        
    point
        .append("circle")
        .attr(D.bound_inner_circle)
        .attr("fill","#585a5a");
    
    dpoint = { el : point, top : rmY, left : rmX };
    
    points.push( dpoint );

    U.e("adding a scale point at: (" + rmX + "," + rmY + ")", "log");

    return dpoint;
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
        leftb    = this.pub.healthyrange[0],
        rightb   = this.pub.healthyrange[1],
        diff     = _interactionState.initialDistance,
        width    = rightb - leftb,
        xpos     = xs.invert(left + diff),
        newRight = xpos + (width * 0.5),
        newLeft  = xpos - (width * 0.5);
    
    /* catch the boundary issues */
    if( newLeft < this.pub.totalrange[0] ){
        newLeft  = this.pub.totalrange[0];
        newRight = width + newLeft;
    } else if ( newRight > this.pub.totalrange[1] ){
        newRight = this.pub.totalrange[1];
        newLeft  = newRight - width;
    }
        
    this.pub.healthyrange = [newLeft, newRight];
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
        rb  = this.pub.healthyrange[1],
        max = this.pub.totalrange[0]; 
    
    if( lp < max ) { lp = max; }
    if( lp > rb ) { lp = rb; }
    
    this.pub.healthyrange[0] = lp;
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
        lb  = this.pub.healthyrange[0],
        max = this.pub.totalrange[1];
    
    if( rp > max ) { rp = max; }
    if( rp < lb ) { rp = lb; }
    
    this.pub.healthyrange[1] = rp;
};

/* _moveWeight
 *
 * Moves the weight bubble along the verticle
 * axis while moving the mouse
 * @param {number} top The mouse position relative to the chart
*/ 
_moveWeight = function ( top ) {
    var ws  = this.ref.weightscale,
        wp  = ws.invert(top);
    
    if( wp < 0 ) { wp = 0; }
    if( wp > 10 ) { wp = 10; }
    
    this.pub.weight = Math.ceil( wp );
};

/* _movePoint
 *
 * Moves a point on the path during drag
 * @param {number} left The mouse position relative to the chart
 * @param {number} top The mouse position relative to the chart
*/ 
_movePoint = function ( left, top ) {
    var indx  = _interactionState.pointIndex,
        point = this.ref.points[indx],
        minX  = D.chart_dimensions.left,
        maxX  = minX + D.chart_dimensions.width,
        minY  = D.chart_dimensions.top,
        maxY  = minY + D.chart_dimensions.height;

    if( left < minX ) { left = minX; }
    if( left > maxX ) { left = maxX; }
    
    if( top < minY ) { top = minY; }
    if( top > maxY ) { top = maxY; }

    point.top  = top;
    point.left = left;
};

/* _doDrag
 *
 * Handles mouse movements
*/  
_doDrag = function ( evt ) {  

    /* if the listener got fired without an event - give up */
    if ( !d3.event || _interactionState.metric === null || _interactionState.activeE === null ){ 
        return false; 
    }
        
    var metric       = _interactionState.metric,
        activeE      = _interactionState.activeE,
        mouseLeft    = d3.event.pageX,
        mouseTop     = d3.event.pageY,
        relativeLeft = mouseLeft - metric.dom.container.offsetLeft,
        relativeTop  = mouseTop - metric.dom.container.offsetTop;
    
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
        case "ww" :
            _moveWeight.call( metric, relativeTop ); 
            break;
        case "point" :
            _movePoint.call( metric, relativeLeft, relativeTop );
        default : 
            break;
    };
    
    /* we have offically moved (at least once) */
    _interactionState.hasMoved = true;
    
    return (activeE === "point") ? metric.updateCurve( ) : metric.reDraw( );
};

/* _doDrag
 *
 * Releases previously bound listeners
*/  
_endDrag = function ( evt ) {
    d3.select(document).on("mousemove", null).on("mouseup", null); // remove event listeners
    
    /* clear out states */
    setTimeout(function () {
        _whipeInteractionState( true );
    }, 3);
};

/* _whipeInteractionState
 *
 * Clears out the old interaction states
 * @param {boolean} wasDrag A flag for if the interaction was a drag
*/
_whipeInteractionState = function ( wasDrag ) {
    _interactionState.metric          = null;
    _interactionState.activeE         = null; 
    _interactionState.initialDistance = null;
    _interactionState.pointIndex      = null;
    _interactionState.isFocused       = false;
    
    /* if it wasnt a drag, we can just go head and set the hasMoved to false */
    if( !wasDrag ){
        _interactionState.hasMoved = false;
        return;
    }
    
    /* delay the hasMoved flag, we dont want our clicks thinking they are ok */
    setTimeout(function ( ) {
        _interactionState.hasMoved = false;
    }, 3);
};


/* _drawInitialPoints
 *
 * Called during the initialization of the
 * data layer in order to populate the fixed 
 * scale points
*/
_drawInitialPoints = function ( ) {
    _interactionState.metric = this;
    
    this.dom.leftCurveAnchor         = _addScalePoint( 0, 0 );
    this.dom.healthyLeftCurveAnchor  = _addScalePoint( 0, 0 );
    this.dom.middleCurveAnchor       = _addScalePoint( 0, 0 );
    this.dom.healthyRightCurveAnchor = _addScalePoint( 0, 0 );
    this.dom.rightCurveAnchor        = _addScalePoint( 0, 0 ); 
    
    return _whipeInteractionState( false );  
};


/* _dailyKeymanager
 *
 * Called on keydown events inside the
 * daily input box
*/
_dailyKeymanager = function ( ) {   
    var evt    = d3.event,
        code   = evt.keyCode,
        isChar = isNaN( parseInt( String.fromCharCode(code), 10) );
        
    /* only allow numbers, enter, and backspace */
    if( code !== 190 && code !== 8 && code !== 13 && isChar ){ 
        return evt.preventDefault && evt.preventDefault(); 
    }
};
        
/* _dailySubmit
 *
 * Called on keyup events inside the
 * daily input box when the keycode is
 * 13 (enter key)
*/  
_dailySubmit = function ( ) {
    var evt    = d3.event,
        code   = evt.keyCode,
        input  = d3.select(this),
        metric = _interactionState.metric,
        value  = parseFloat( input.node().value );
    
    if( code !== 13 ){ return; }
    
    value = ( isNaN(value) ) ? 0 : value;
    
    // if( value > metric.pub.totalrange[1] ){ value = metric.pub.totalrange[1]; }
    // if( value < metric.pub.totalrange[0] ){ value = metric.pub.totalrange[0]; }
        
    metric.pub.dayvalue = value;
    
    metric.refreshInput( );
    
    return input.node().blur && input.node().blur();
};
        
/* Metric.layerPrep.ui
 *
 * Prepares the metric's ui layer with 
 * the axis
*/
ui = function ( layer ) {  
    var xs = this.ref.xscale,
        ys = this.ref.yscale,
        or = this.ref.boundaryflags[1], // open on the right boundary?
        ol = this.ref.boundaryflags[0], // open on the left boundary?
        xt = xs.ticks(10),
        yt = ys.ticks(3);
        
        
    layer
        .selectAll("text.xticks")
        .data(xt).enter().append("text")
        .text(function (d, ind) { 
            return ( (d === xt[xt.length-1] && or) || (d === xt[0] && ol) ) 
                        ? d + "+" 
                        : d; 
        })
        .attr("x", function(d, i) { return xs(d); })
        .attr("text-anchor", "middle")
        .attr(D.svg_text)
        .attr("y", D.chart_dimensions.top + D.chart_dimensions.height + 18);
        
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
    
    layer
        .append("text")
        .attr(D.title_text)
        .text(this.pub.name);
        
    layer
        .append("text")
        .attr(D.unit_text)
        .text(this.pub.unitlabel);
    
    layer.append("line")
        .attr(D.weight_bar);
        
    layer.append("circle")
        .attr(D.weight_bounds)
        .attr("cy", 40);
    
    layer.append("circle")
        .attr(D.weight_bounds)
        .attr("cy", 135);
    
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
        points = metric.ref.points,
        rangeRect, leftBound, rightBound,
        weightNode, coverRect, 
        curvePath, pointGroup, curveGroup,
        curveBubble, pastValue, inputGroup,
        inputScoreGroup;
    
    coverRect = layer.append("rect")
                    .attr( D.svg_cover )
                    .attr("data-name","click-catcher")
                    .on("click", function () {
                        // _interactionState.metric = metric;
                        // return _addScalePoint( d3.event );
                    });
    
    
    rangeRect = layer.append("rect")
                    .attr(D.range_rect)
                    .attr("data-name", "range-rectangle")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "rr";   // we are using the range rect
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );               // begin registering events  
                    }).on("click", function ( ) {
                        // _interactionState.metric  = metric;
                        // return _addScalePoint( d3.event );
                    });
                    
    leftBound  = layer.append("g")
                    .attr("data-name","left-node")
                    .attr("cursor","pointer")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE  = "lb";   // we are using the range rect
                        _interactionState.metric   = metric; // save the metric being acted upon
                        return _startDrag( );                // begin registering events 
                    });
                    
    rightBound = layer.append("g")
                    .attr("data-name","right-node")
                    .attr("cursor","pointer")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "rb";   // we are using the range rect
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );               // begin registering events 
                    });
    
    weightNode = layer.append("g")
                    .attr("data-name", "weight-node")
                    .attr("cursor", "pointer")
                    .on("mousedown", function ( ) {
                        _interactionState.activeE = "ww";   // we are using the weight circle
                        _interactionState.metric  = metric; // save the metric being acted upon
                        return _startDrag( );
                    });
    
    curveGroup = layer.append("g")
                    .attr("data-name", "curve-group");
    
    curvePath = curveGroup
                    .append("path")
                    .attr(D.curve_path)
                    .attr("pointer-events", "none");
                    
    curveBubble = curveGroup
                    .append("g")
                    .attr("data-name", "curve-bubble")
                    .attr("opacity", 0.0)
                    .attr("pointer-events", "none");
    
    inputGroup = layer
                    .append("g")
                    .attr("data-name", "input-group");
    
    pointGroup = layer
                    .append("g")
                    .attr("data-name", "point-group");

    curveBubble
        .append("circle")
        .attr(D.curve_bubble);
        
    curveBubble
        .append("text")
        .attr(D.curve_text);
    
    
    leftBound.append("circle").attr(D.bound_outer_circle);
    rightBound.append("circle").attr(D.bound_outer_circle);
    
    weightNode
        .append("circle")
        .attr(D.bound_outer_circle)
        .attr("r", 16.5);
    
    leftBound.append("circle").attr(D.bound_inner_circle);
    rightBound.append("circle").attr(D.bound_inner_circle);
    
    weightNode
        .append("circle")
        .attr(D.bound_inner_circle)
        .attr("fill", "#585a5a")
        .attr("r", 12.5)
        .attr("cx", 0);
    
    leftBound.append("text").attr(D.bound_text);
    rightBound.append("text").attr(D.bound_text);
    
    weightNode
        .append("text")
        .attr(D.bound_text)
        .attr("fill","#fff")
        .attr("y", 5)
        .text( 4 );
    
    layer.on("mousemove", function () {
        
        /* only call scrubber if there is no dragging */
        if( !_interactionState.hasMoved && !_interactionState.isFocused ) {          
            _interactionState.metric  = metric; // save the metric being acted upon
            _scrubPath( d3.event );             // update the scrubber information
        }
        
    }).on("mouseout", function () {
        metric.dom.curveBubble.transition().duration(20).attr("opacity", 0.0);
    });
    
    inputGroup
        .append("line")
        .attr(D.input_line)
        .attr("y1", D.chart_dimensions.top)
        .attr("y2", D.chart_dimensions.top + D.chart_dimensions.height);
    
    inputScoreGroup = inputGroup
                        .append("g")
                        .attr("data-name", "input-score-group");
                        
    inputScoreGroup 
        .append("circle")
        .attr(D.input_score_circle);
        
    inputScoreGroup 
        .append("text")
        .attr(D.curve_text);
    
    /* attatch the keypress to the input box */
    dom.dayInput
        .on("focus", function () {  
            if( !_interactionState.hasMoved ) {             
                var input = d3.select(this),
                    value = input.attr("value");
                
                pastValue = value;
                _interactionState.metric    = metric; 
                _interactionState.isFocused = true;
                
                input.attr("value",""); 
            }
        })
        .on("keydown", _dailyKeymanager )
        .on("keyup", _dailySubmit )
        .on("blur", function () {
            var input = d3.select(this),
                value = input.attr("value");
                
            if( value === "" ){
                input.attr("value", pastValue );
            }
            
            _whipeInteractionState( );
        });
    
    
    dom.inputGroup  = inputGroup;
    dom.curveBubble = curveBubble; // the scrubber bubble group
    dom.curvePath   = curvePath;   // ref to the bezier curve (<path>)
    dom.pointGroup  = pointGroup;  // save the group for data points
    dom.weightNode  = weightNode;  // save the weight node
    dom.rangeRect   = rangeRect;   // save the range rectangle
    dom.leftNode    = leftBound;   // save the left bound
    dom.rightNode   = rightBound;  // save the right bound 
    
    
    return _drawInitialPoints.call(metric);
};

/* dump the layer prepping functions back out */
return { ui : ui, data : data };

})( );

Metric.prototype = {
    constructor : Metric,
    version     : "1.3",
    
    /* metric.rig
     *
     * Constructs a new metric object
     * @param {object} opts The options to build a metric with
    */
    rig : function ( opts ) {

        /* the object that will keep references to values, names.. etc !VISIBLE! */
        this.pub = { 
            
            /* {string} the name of the metric */
            name : opts.name || "N/A",
            
            /* {number} the score entered in today or the previous day */
            dayvalue : opts.dayvalue || false,
            
            /* {array} range of values that are okay (green) */
            healthyrange : (opts.features && opts.features.healthyrange) 
                            ? opts.features.healthyrange 
                            : D.healthy_range,
            
            /* {array} maximum range of values */         
            totalrange : (opts.features && opts.features.totalrange) 
                            ? opts.features.totalrange 
                            : D.total_range,
            
            /* {number} how significant this score is to the hScore */
            weight : (opts.features && opts.features.weight) 
                            ? opts.features.weight 
                            : D.weight,
            
            /* {string} how this metric is measured (mg/dL) */
            unitlabel : (opts.features && opts.features.unitlabel) 
                            ? opts.features.unitlabel 
                            : D.unitlabel
            
        };
            
        var w = D.chart_dimensions.width,
            l = D.chart_dimensions.left,
            t = D.chart_dimensions.top,
            h = D.chart_dimensions.height;
        
        /* an object reference to store things like scales and etc.. */
        this.ref = {
            
            /* boundary conditions (open, closed)? */
            boundaryflags : (opts.features && opts.features.boundaryflags) 
                            ? opts.features.boundaryflags 
                            : D.boundary_flags,
            
            /* the x scale */
            xscale : d3.scale.linear().domain(this.pub.totalrange).range([l, l + w]),            
            
            /* the y scale */
            yscale : d3.scale.linear().domain([0,100]).range([h+t,t]),
            
            /* an array for points to be placed in */  
            points : [ ],                                                     
            
            /* the scale used for calculating weight positions */
            weightscale : d3.scale.linear().domain([0,10]).range([h+t,t]),          
            
            /* a quick property for half of the total range */
            halftotal : this.pub.totalrange[0] + ( ( this.pub.totalrange[1] - this.pub.totalrange[0] ) * 0.5 ),
            
            /* the svg path element command generator */
            linegen : d3.svg.line()
                            .x(function (d) { return d.x; })
                            .y(function (d) { return d.y; })
                            .interpolate("line")
        };
        
        this.uid   = U.uid(); // give this metric a unique identifier
        this.index = hMetricIndex;
        this.dom   = { };     // save room for the metric's dom elements
        
        /* finish by rendering up the article and svg */
        this.render( );
    },
    
    /* metric.render
     *
     * creates the necessary DOM elements 
    */
    render : function ( ) {
        var i = 0, layer, name,
            container = document.createElement("article"),
            context   = d3.select(container).append("svg"),
            dayInput  = d3.select(container).append("input"),
            block     = d3.select(container).append("div"),
            dom       = this.dom,
            inputY    = D.chart_dimensions.top + D.chart_dimensions.height + 4;
                        
        d3.select(container) // set the metric container's class
            .attr("class", "metric cf middle"); 
            
        block
            .attr(D.block)
            .append("span");
        
        context // set the default properties of the svg element
            .attr(D.svg_element); 
        
        dayInput // set the default properties of the input box
            .attr(D.daily_inputbox)
            .style({"top"  : inputY + "px"});
                    
        dom.dayInput         = dayInput;
        dom.loader           = block;
        dom.container        = container; // save the html container
        dom.svg_element      = context;   // save the svg element
        dom.layers           = { };
        
        /* make SVG groups that will represent layers */
        for(i; name = D.svg_layers[i], i < D.svg_layers.length; i++){
            layer = context.append("g").attr("data-name", name);
            
            dom.layers[name] = layer;
                    
            /* if there is a prep function defined for this layer */
            if( Metric.layerPrep[name] && U.type(Metric.layerPrep[name]) === "function" ){
                Metric.layerPrep[name].call(this, layer);
            }
    
        }
                
        return this.reDraw( ) && this.refreshInput( );
    },
    
    /* metric.reDraw
     *
     * called after the metric's range has changed
    */
    reDraw : function () {
        var xs         = this.ref.xscale,
            ys         = this.ref.yscale,
            ws         = this.ref.weightscale,
            dom        = this.dom,
            rect       = dom.rangeRect,
            leftNode   = dom.leftNode,
            rightNode  = dom.rightNode,
            weightNode = dom.weightNode,
            or         = this.ref.boundaryflags[1],
            ol         = this.ref.boundaryflags[0],
            weight     = this.pub.weight,
            leftb      = xs( this.pub.healthyrange[0] ),
            rightb     = xs( this.pub.healthyrange[1] ),
            leftt      = xs( this.pub.totalrange[0] ),
            rightt     = xs( this.pub.totalrange[1] ),
            width      = rightb - leftb,
            rtext      = (or && rightt === rightb) 
                            ? this.pub.healthyrange[1].toFixed(0) + "+" 
                            : this.pub.healthyrange[1].toFixed(0),
            ltext      = (ol && leftt === leftb) 
                            ? this.pub.healthyrange[0].toFixed(0) + "+" 
                            : this.pub.healthyrange[0].toFixed(0);
                                        
        rect 
            .attr("x", leftb)
            .attr("width", width);
        
        leftNode
            .attr("transform", U.mts(leftb) ) // move the left node into postion
            .selectAll("text").text( ltext );
            
        rightNode
            .attr("transform", U.mts(rightb) ) // move the right node into postion 
            .selectAll("text").text( rtext );
            
        weightNode
            .attr("transform", U.mts(837.5, ws(weight) ) )
            .selectAll("text").text( weight.toFixed(0) );

            
       return this.updateCurve( );
    },
    
    
    /* metric.updateCurve
     *
     * called after the metric's score curve has changed
    */
    updateCurve : function ( ) {
        var xscale       = this.ref.xscale,
            yscale       = this.ref.yscale,
            healthyLeft  = xscale( this.pub.healthyrange[0] ),
            healthyRight = xscale( this.pub.healthyrange[1] ), 
            healthyMid   = healthyLeft + ( (healthyRight - healthyLeft) * 0.5 ),
            totalLeft    = xscale( this.pub.totalrange[0] ),
            totalRight   = xscale( this.pub.totalrange[1] ),
            vertRoom     = yscale(0) - yscale(100),
            points       = this.ref.points,
            linegen      = this.ref.linegen,
            curve        = this.dom.curvePath,
            indx, point, parts = [ ], lAnchorY = 0, rAnchorY = 0;
        
        /* hide the curve bubble while moving */
        this.dom.curveBubble.attr("opacity", 0);
        
        /* if the anchors are close the to the edge, account for it */
        if( vertRoom > (totalRight - healthyRight) ) {
            rAnchorY = 100 - ( ( (totalRight - healthyRight) / vertRoom) * 100);
        } 
        if ( vertRoom > (healthyLeft - totalLeft) ) {
            lAnchorY = 100 - ( ( (healthyLeft - totalLeft) / vertRoom) * 100);
        }
        
        /* force anchor positions */
        this.dom.leftCurveAnchor.left = totalLeft;
        this.dom.leftCurveAnchor.top  = yscale( ( (healthyLeft - totalLeft) < 2 ) ? 100 : 0 );
        
        this.dom.healthyLeftCurveAnchor.left = healthyLeft;
        this.dom.healthyLeftCurveAnchor.top  = yscale( ( (healthyLeft - totalLeft) < 2 ) ? 100 : 70 );
        
        this.dom.middleCurveAnchor.left = healthyMid;
        this.dom.middleCurveAnchor.top  = yscale( 100 );
        
        this.dom.healthyRightCurveAnchor.left = healthyRight;
        this.dom.healthyRightCurveAnchor.top  = yscale( ( (totalRight - healthyRight) < 2 ) ? 100 : 70 );
        
        
        this.dom.rightCurveAnchor.left = totalRight;
        this.dom.rightCurveAnchor.top  = yscale( ( (totalRight - healthyRight) < 2 ) ? 100 : 0 );
    
        for( indx = 0; indx < points.length; indx++ ) {
            /* grab the current point */
            point = points[indx];
            
            parts.push({ x : point.left, y : point.top });
            
            /* move the point */
            point.el.attr("transform", U.mts(point.left, point.top) );
        }
        
        curve
            .datum(parts)
            .attr("d", this.ref.linegen);   
        
        return this.refreshInput( );     
    },
    
    
    /* metric.getScoreAlongCurve
     *
     * Given an xposition relative to the SVG container,
     * returns a point object with x and y values of a 
     * point along the path
     * @param {number} xposition X value reltive to the SVG
    */
    getScoreAlongCurve : function ( xposition ) {
    
        var metric  = this,
            yscale  = metric.ref.yscale,
            xscale  = metric.ref.xscale,
            pathe   = metric.dom.curvePath.node(),
            points  = metric.ref.points,
            pLength = pathe.getTotalLength(),
            minDist = Number.MAX_VALUE, 
            scrubVal, pathPoint, closePoint,
            distance, inc, dec;

        for(inc = 0, dec = parseInt(pLength,10); inc < pLength && dec > 0; dec--, inc++){
            
            pathPoint = pathe.getPointAtLength( inc );
            distance  = Math.abs( xposition - pathPoint.x );
            
            if( distance < minDist ){
                closePoint = pathPoint;
                minDist    = distance;
            }
            /* if it's close enough, stop looking */
            if( distance < 2){ break; }
            
            pathPoint = pathe.getPointAtLength( dec );
            distance  = Math.abs( xposition - pathPoint.x );
            
            if( distance < minDist ){
                closePoint = pathPoint;
                minDist    = distance;
            }
        
            /* if it's close enough, stop looking */
            if( distance < 2){ break; }
        }
        
        return closePoint;
    },
    
    
    /* metric.refreshInput
     *
     * Moves the input box and input group inside the SVG
    */
    refreshInput : function ( ){
        var value   = (U.type(this.pub.dayvalue) === "number") ? this.pub.dayvalue : 0,
            xscale  = this.ref.xscale,
            yscale  = this.ref.yscale,
            inpute  = this.dom.dayInput,
            inputg  = this.dom.inputGroup,
            or      = this.ref.boundaryflags[1],
            ol      = this.ref.boundaryflags[0],
            hr      = this.pub.healthyrange[1],
            hl      = this.pub.healthyrange[0],
            tr      = this.pub.totalrange[1],
            tl      = this.pub.totalrange[0],
            healthy = !( (value > hr) || (value < hl) ),
            inputX  = (U.type(value) === "number") 
                        ? xscale(value) 
                        : D.chart_dimensions.left + (D.chart_dimensions.width * 0.5),
            scorep  = this.getScoreAlongCurve( inputX ); 
        
        /* lock the x position to the edges */
        if( value > tr ){ inputX = xscale( tr ); }
        if( value < tl ){ inputX = xscale( tl ); }
        
        /* if it is on an open side and greater than the max */
        if( ( (tr == hr) && (value >= hr) && or ) || ( (tl == hl) && (value <= hl) && ol ) ){ 
            healthy = true;
        }
        
        inpute
            .style({"left" : inputX+'px'})
            .node().value = value;
            
        inputg
            .attr("transform", U.mts(inputX, 0.0) );
        
        inputg
            .select("line")
            .attr("y1", scorep.y);
        
        inputg
            .select("g")
            .attr("transform", U.mts(0, scorep.y) );
        
        inputg
            .select("g")
            .select("circle")
            .attr("fill", (healthy) ? D.health_colors["healthy"] : D.health_colors["unhealthy"] );
            
        inputg
            .select("g")
            .select("text")
            .text( Math.floor( yscale.invert( scorep.y ) ) );
                     
        return true;
    },
    
    /* metric.strip
     *
     * returns a metric object without access
     * to the DOM elements or it's functions 
    */
    strip : function () {
        
        var metric = this,
            fader  = (function (metric) {
                return function () {
                    metric.dom.loader
                        .transition()
                        .duration(300)
                        .delay( metric.index * 200 )
                        .style({"opacity":"0.0"})
                        .each("end", metric.hideLoader.bind(metric) );
                };
            })(metric);
        
        /* fade the metric in after safe time */
        setTimeout(fader, D.fade_delay);
         
        return this.pub;
    },
    
    /* metric.hideLoader
     * 
     * Hides the loading div after it fades out
    */
    hideLoader : function () {
        this.dom.loader
            .style({"display":"none"});
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
        _prepMixer,         // Initialization function
        _populateMetrics,   // Metric creation function 
        _setOptions,        // Optional option setting
        _svgDefs,           // creation of handy SVG styles
        _prepSubmitForm,    // function for setting up the form
        _keyManager,        // event listener for input boxes
        _renderGenderData,  //
        _prepGenderToggles, //
        _genderToggle,      //
        _finalize;          //
        

/* _finalize
 *
 * Loops through the list of metric objects,
 * add their striped object to the global 
 * private hMetrics array
 * @param {array} metrics A list of created metrics
*/
_finalize = function (metrics) {
    var i, pub;
    
    for(i = 0; i < metrics.length; i++){
        pub = metrics[i].strip( );
        
        hMetrics.push( pub );
    }
    
    return true;
};


/* _keyManager
 *
 * Prepares the input boxes for key events
*/
_keyManager = function ( ) {
    var evt     = d3.event,
        key     = evt.keyCode,
        inpt    = d3.select( this ),
        valu    = inpt.node().value,
        keychar = parseInt( String.fromCharCode(key), 10 ),
        isNum   = ( !isNaN(keychar) ) ? true : false;
        
    if( (valu.length > 1 && key !== 8 && key !== 9) || (!isNum && key !== 8 && key !== 9) ){ 
        evt.preventDefault && evt.preventDefault(); 
        return false; 
    }

};


/* _genderToggle
 * 
 * Re renders the metrics upon gender change
*/
_genderToggle = function ( ) {
    var evt = d3.event,
        gen = d3.select( this ).attr("data-gender"),
        par = d3.select( this.parentNode ).select("button.active").classed("active", false);
    
    d3.select(this).classed("active", true);
    
    hGenderIndex = (gen === "male") ? 0 : 1;
    
    _renderGenderData( );
    
    return ( evt.preventDefault && evt.preventDefault() ) ? false : false;
};

/* _prepGenderToggles
 * 
 * Seeks gender toggles and binds events
*/
_prepGenderToggles = function ( ) {
    var query = (hSubmitForm.querySelectorAll("button.g-toggle").length > 0) 
                    ? hSubmitForm.querySelectorAll("button.g-toggle")
                    : [ ],
        button, indx;
    
    for( indx = 0; indx < query.length; indx++ ){
        button = query[indx];
        d3.select(button).on("click", _genderToggle);
    }
};


/* _prepSubmitForm
 *
 * Prepares the form for events and such
 * @param {string} formClass The query to be made for the object
*/
_prepSubmitForm = function ( formClass ) {
    if( !document.querySelectorAll ){ return false; }
    
    var query  = document.querySelectorAll( formClass ),  
        item   = (query.length > 0) ? query[0] : false,
        inputs = (item) ? item.querySelectorAll("input.height-input") : [ ],
        index, input;
    
    /* prep the input text elements */
    for( index = 0; index < inputs.length; index++ ){
        input = inputs[index];
        
        d3.select(input)
            .on("keydown", _keyManager);
    }
    
    return item;
};


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

    D.range_rect.fill = options.range_fill || D.range_rect.fill;     // range box color
    D.svg_text.fill   = options.text_fill || D.svg_text.fill;        // text color
    D.healthy_range   = options.healthy_range || D.healthy_range; // healthy range 
    D.total_range     = options.total_range || D.total_range;        // total range 
    D.form_class      = options.form_class || D.form_class;          // form class
    
    /* remove text selection (highlighting) */
    if( options.allowTextSelection === false ){
        document.onselectstart = function (evt) { 
            evt.preventDefault && evt.preventDefault(); 
            return false; 
        };
    }
};

/* _renderGenderData
 * 
 * Reuseable rendering loop 
 */
_renderGenderData = function ( ){
    var i, j, metric, gender, mlist, metrics;
    
    
    gender  = hOriginalData[hGenderIndex].gender;  // which gender is this list
    mlist   = hOriginalData[hGenderIndex].metrics; // get the metric list
    metrics = [ ];                                 // reset metric array
    
    /* clear out old html */
    hRenderZone.innerHTML = "";
    /* reset old gender index */
    hMetricIndex = 0;
    
    
    /* loop through the metrics */        
    for(j = 0; j < mlist.length; j++){
                
        /* build a new metric */
        metric = Metric( mlist[j] );
        
        hMetricIndex++;
        
        /* render the new metric */
        hRenderZone.appendChild( metric.dom.container );
        
        /* push the stripped metric into the hMetrics array */
        metrics.push( metric );
        
    }

    return _finalize( metrics );
}


/* _prepMixer
 * 
 * Gets rendering zone, populates metrics
 * @param {array} metricData An array of metric information 
*/
_populateMetrics = function ( metricData ) {    
    
    if( U.type(metricData) !== "array" ){ 
        return U.e("Improper data format; must be of type \"array\""); 
    }

    hRenderZone.innerHTML = "";         // clear out old metrics
    hOriginalData         = metricData; // save a reference 
    
    if( __ajaxCallback && U.type( __ajaxCallback ) === "function" ){
        __ajaxCallback( );
    }
    
    return _renderGenderData( );
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
    
    /* try prepping the submit form */
    hSubmitForm = _prepSubmitForm( D.form_class );
    
    if( hSubmitForm !== false ) {
        /* prep the gender toggles */
        _prepGenderToggles( );
    }
    
    /* find the context to render metrics inside */
    hRenderZone = document.getElementById("metrics")
                    || document.getElementById("context")
                    || document.getElementById("hMixer")
                    || document.body.appendChild(document.createElement("section"));
    
    
    d3.select(hRenderZone)
        .attr("class","f metrics cf")
        .attr("id", "metrics");
    
    
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
    version : "1.3", 
    
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
        
        var i, j, metric, mname;
        
        for(i = 0; i < hMetrics.length; i++) {
            for(j = 0; j < hMetrics[i].length; j++) {
            
                metric = hMetrics[i][j];
                mname  = metric.name;
    
                if(mname.toLowerCase() === name.toLowerCase()){ return metric; }
            }
        }
        
        return false;
    }
};

return __mixer;
    
})();

    
    
window.Mixer = Mixer;          // Show the Mixer object to the outside
window.Entry = Utils.domReady; // Let the domReady function be used

})();


