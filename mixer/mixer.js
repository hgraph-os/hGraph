/*
 * mixer.js
 *
 * Main javascript file for hGraph mixer. This file
 * will populate the page with metric graphs
 *
 * Author: Danny Hadley
 * Date: January 2013
*/
var Mixer;

Mixer = (function( window, data){

    "use strict";
    
    var 
        /* private variables */
        zPlots     = [ ],
        zNS        = { svg : "http://www.w3.org/2000/svg" },
        zDefaults  = { },
        zEvents    = { },
        zData      = data,
        zVersion   = "1.0",
        zPrepped   = false,
        zContextID = "context",
        zContext,
        
        /* the metric class/object */
        Metric = function (name, opts) { 
            return new Metric.prototype.init( name, opts );  
        },
        
        /* a utility wrapper for DOM manipulation */
        Utils = function (object) {
            return new Utils.prototype.rig( object );
        },
        
        /* add svg definitions to the page */
        addDefs = function () {
            
            var svg      = Utils(document.body).append({ space : zNS.svg, local : "svg" }),
                defs     = svg.append({ space : zNS.svg, local : "defs" }),
                filter   = defs.append({ space : zNS.svg, local : "filter"}),
                offset   = filter.append({ space : zNS.svg, local : "feOffset"}),
                gaussian = filter.append({ space : zNS.svg, local : "feGaussianBlur"}),
                flood    = filter.append({ space : zNS.svg, local : "feFlood"}),
                compin   = filter.append({ space : zNS.svg, local : "feComposite"}),
                compout  = filter.append({ space : zNS.svg, local : "feComposite"});
                
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
        },
        
        /* dom ready intro */
        onReady = function () {
            if(!!zPrepped){ return; }
            
            Utils(document).bind("selectstart", function (evt) { 
                evt.preventDefault && evt.preventDefault(); 
                return false; 
            });
            
            addDefs( ); // add an svg with filters and stuff
                           
            /* only initialize once */
            zPrepped = true;
            zContext = document.getElementById( zContextID )||Utils(document.body).append("section").attr("id","context");
            
            var i, metric;
            for(i = 0; i < zData.length; i++){
                metric = Metric( zData[i].name, zData[i].features );
                zPlots.push(metric);
                metric.render(zContext);
            }    
        };


zDefaults.container  = { "class" : "hMetric middle" };
zDefaults.dimensions = { width  : 500, height : 140 };

/* chart padding definitions */
zDefaults.padding = { };
zDefaults.padding.bottom = zDefaults.padding.right = 24.5;
zDefaults.padding.left = zDefaults.padding.top = 10.5;


zDefaults.layers = ["ui","data","interaction"];
zDefaults.chart = {
    left   : zDefaults.padding.left,
    right  : zDefaults.dimensions.width - zDefaults.padding.right,
    top    : zDefaults.padding.top,
    bottom : zDefaults.dimensions.height - zDefaults.padding.bottom,
};
zDefaults.chart.width  = zDefaults.chart.right - zDefaults.chart.left;
zDefaults.chart.height = zDefaults.chart.bottom - zDefaults.chart.top;

zDefaults.axis = {
    general : { "style" : "stroke:#d3d5d5;" },
    x : {
        "x1" : zDefaults.chart.left,
        "x2" : zDefaults.chart.right,
        "y1" : zDefaults.chart.bottom,
        "y2" : zDefaults.chart.bottom
    },
    y : {
        "x1" : zDefaults.chart.right,
        "x2" : zDefaults.chart.right,
        "y1" : zDefaults.chart.top,
        "y2" : zDefaults.chart.bottom
    },
    text : { "fill" : "#adb0af", "font-size" : "12px" }
};
    
/* 
 *
 *
*/
Utils.prototype = {
    
    constructor : Utils,
    utils : "1.0",
    
    rig : function (object) {
        this[0]  = (typeof object !== "string") ? object : this.make(object);
        this.uid = Utils.uid();
    },
    
    attr : function (name, value) {
        var i, node = this[0],
            type = typeof name, 
            argc = arguments.length; 
            
        if ( type !== "string" && type === "object" ) {
            for(i in name){
                if( !name.hasOwnProperty(i) ){ continue; }
                 node.setAttribute(i, name[i]);
            }
        } else if ( type === "string" && argc === 2 ) {
            node.setAttribute(name, value);
        } else if ( argc === 1 && type === "string" ) { 
            return node.getAttribute(name);
        }
        return this;
    },
    
    text : function (value) {
        this[0].textContent = this[0].innerText = value;  
        return this;
    },
    
    style : function (name, value){
        var type = typeof name,
            argc = arguments.length,
            node = this[0],
            stringed = "",
            makestring = function ( prop, value ) { return prop + ":" + value + ";"; },
            i;
            
        if ( type !== "string" && type === "object" ) {
            
            for(i in name){
                if( !name.hasOwnProperty(i) ){ continue; }
                stringed += makestring( i, name[i] );
            }
            node.setAttribute( "style", stringed );
            
        } else if ( type === "string" && argc === 2 ) {
            
            node.setAttribute( "style", makestring( name, value ) );
        
        }
        
        return this;
    },
    
    make : function (name) {
        return (name.space) 
                ? document.createElementNS(name.space, name.local)
                : document.createElement(name);
    },
    
    append : function (name) {
        var child = name.utils ? name[0] : this.make(name), 
            node  = this[0].appendChild( child );
                
        return Utils(node);
    },
    
    bind : (function (d) {
        
        function addE (event, callback){
            zEvents[this.uid] = zEvents[this.uid] || { }; // reserve a new object or use an existing
            zEvents[this.uid][event] = callback;          // add the callback to the registry
            
            this[0].addEventListener(event, callback, false);
            return this;
        };
        
        function attatchE (event, callback) {
            this[0].attachEvent("on"+event, callback );
            return this;
        };
    
        return (d.addEventListener) ? addE : attatchE;
        
    })( document.createElement("div") ),
    
    unbind : (function (d) {
        
        function removeE (event, callback) {
            
            if( zEvents[this.uid] && !callback ) {
                this[0].removeEventListener(event, zEvents[this.uid][event]);
                return this;
            }
            
            this[0].removeEventListener(event, callback);
            return this;
        };
        
        function detatchE (event, callback) {
        
            if( zEvents[this.uid] && !callback ) {
                this[0].detachEvent(event, zEvents[this.uid][event]);
                return this;
            }
            
            this[0].detachEvent("on"+event, callback);
            return this;
        };
    
        return (d.removeEventListener) ? removeE : detatchE;
        
    })( document.createElement("div") )
    
};

Utils.uid = (function () {
    var i = 0;
    return function () { return ++i + "-uid"; };
})();

/* add prototype to object used with init */
Utils.prototype.rig.prototype = Utils.prototype;

Metric.layerSetup = {
    ui : function (layer) {
        
        var tick;

        this.xTicks = this.xscale.makeTicks(10, function (position,value) {
            tick = layer.append({ space : zNS.svg, local : "text" })
                        .attr({
                            "x"           : position,
                            "y"           : zDefaults.chart.bottom + 12,
                            "text-anchor" : "middle"
                        });
                        
            return tick;
        });
        
        this.yTicks = this.yscale.makeTicks(3, function (position,value) {
            tick = layer.append({ space : zNS.svg, local : "text" })
                        .attr({
                            "y" : position,
                            "x" : zDefaults.chart.right + 4
                        });
                        
            return tick;
        });
        
        /* add the axis lines */
        layer.append({ space : zNS.svg, local : "line" })
                .attr({
                    "x1" : zDefaults.chart.left,
                    "x2" : zDefaults.chart.right,
                    "y1" : zDefaults.chart.bottom,
                    "y2" : zDefaults.chart.bottom 
                }).style({
                    "stroke" : "#d3d5d5"
                });
                
        layer.append({ space : zNS.svg, local : "line" })
                .attr({
                    "x1" : zDefaults.chart.right,
                    "x2" : zDefaults.chart.right,
                    "y1" : 0 ,
                    "y2" : zDefaults.chart.bottom 
                }).style({
                    "stroke" : "#d3d5d5"
                });
    
        
    },
    
    data : function (layer) {
        var metric    = this,
            rect      = layer.append({ space : zNS.svg, local : "rect" }),
            leftNode  = layer.append({ space : zNS.svg, local : "g" }),
            rightNode = layer.append({ space : zNS.svg, local : "g" }),
            uDoc      = Utils(document);
            
        function eDrag () {
            uDoc.unbind("mousemove").unbind("mouseup", eDrag);
        };
        function sDrag (part) {
            metric.active = part;
            uDoc.bind("mousemove", metric.updateRange.bind(metric)).bind("mouseup", eDrag);
        };
        
        rect.attr({
            "data-node" : "rect",
            "height"    : zDefaults.chart.height,
            "y"         : zDefaults.chart.top
        }).style({
            "fill"   : "#becc9f",
            "cursor" : "move"
        }).bind("mousedown", function (evt) {
            metric.lastLeft = evt.pageX; 
            sDrag(rect);
        });
                
        /* set the group's transform properties */
        leftNode
            .attr("data-node","left")
            .style("cursor", "pointer")
            .bind("mousedown", function () {
                sDrag(leftNode);
            });
            
        rightNode
            .attr("data-node","right")
            .style("cursor", "pointer")
            .bind("mousedown", function () {
                sDrag(rightNode);
            });
        
        function addDots() {
            this.append({ space : zNS.svg, local : "circle" }).attr({
                "r"      : 6,
                "filter" : "url(#shadow)"
            }).style({
                "fill" : "#fff"
            });
            
            this.append({ space : zNS.svg, local : "circle" }).attr({
                "r"  : 3,
            }).style({
                "fill" : "#819a4d"
            });
            
            this.textnode = this.append({ space : zNS.svg, local : "text" }).attr({
                "text-anchor" : "middle",
                "x"           : 0,
                "y"           : 20
            }).style({
                "fill"      : "#414443",
                "font-size" : "14px"
            });
        
        };
        
        addDots.call(leftNode);
        addDots.call(rightNode);
    
        /* save references */
        this.scrubber   = rect;
        this.leftBound  = leftNode;
        this.rightBound = rightNode;
        
        this.updateParts();
    }
};

Metric.boundTransform = function (xpos) {
    var midy = (zDefaults.chart.bottom * 0.5) + zDefaults.chart.top,
        attr = "translate(" + xpos + "," + midy + ")";
    return attr;
};

Metric.scale = function (domain, range) { 

    var scale = function (value) { 
        var back = domain[1] - domain[0],
            rel  = value - domain[0],
            val  = rel / back,
            dist = (range[1] - range[0]) * val;
        
        return range[0] + dist;  
    };
    
    scale.reverse = function (value) { 
        var back = range[1] - range[0],
            rel  = value - range[0],
            val  = rel / back;
        
        return (domain[1] * val); 
    };
    
    scale.makeTicks = function (count, callback) {
        var ainc  = (domain[1] - domain[0]) / count,
            space = (range[1] - range[0]) / count,
            ticks = [ ], i = -1, pos = range[0], val = 0,
            tick;
            
        for( i; ++i <= count; pos += space, val += ainc ) { 
            tick = (callback) 
                    ? callback(pos, val) 
                    : Utils({ space : zNS.svg, local : "text" });
            
            tick.text(val.toFixed(0)).style(zDefaults.axis.text);
            
            ticks.push(tick);
        }
        return ticks;
    };
    
    scale.range  = range;
    scale.domain = domain;  
     
    return scale;
};


Metric.prepLayers = function (){ 
    var layers = zDefaults.layers,
        svg    = this.svg,
        layer, i, name;
    
    this.layers = { };
    
    for(i = -1; ++i < layers.length;){
        name  = layers[i];
        layer = svg.append({ space : zNS.svg, local : "g" });
        
        /* add a data attribute */
        layer.attr("data-name",name);
        
        /* add the layer to the metric object */
        this.layers[name] = layer;
        
        /* try initializing the layer */
        Metric.layerSetup[name] && Metric.layerSetup[name].call(this,layer);   
    }

};

Metric.build = function ( ) {
    var div      = document.createElement('div'),
        svg      = Utils(div).append({ space : zNS.svg, local : "svg" }),
        divAttr  = zDefaults.container,
        svgAttr  = zDefaults.dimensions,
        xscale   = Metric.scale(this.totalrange,[zDefaults.chart.left, zDefaults.chart.right]),
        yscale   = Metric.scale([0,100],[zDefaults.chart.bottom, zDefaults.chart.top]);

    svg.attr({ "width" : svgAttr.width, "height" : svgAttr.height });
    
    Utils(div).attr(zDefaults.container);   

    /* save these objects */
    this.container = div;
    this.svg       = svg;
    this.xscale    = xscale;
    this.yscale    = yscale;
    
    return Metric.prepLayers.call(this);
}; 
         

Metric.prototype = { 
    
    constructor : Metric,   // reference back to the Metric function
    version     : zVersion, // version number
    
    /* main construction function */
    init : function (name, opts){ 
        var uid  = Utils.uid(),
            info = opts || { };
        
        this.uid        = uid;
        this.name       = name || "";
        this.totalrange = info.totalrange || [0,100]; 
        this.saferange  = info.saferange || [50,80]; 
        
        /* build the svg and container */
        return Metric.build.call( this );
    },
    render : function (context) {
        context.appendChild(this.container);
    },
    scrubRect : function (left) {
        var midb   = this.xscale.reverse(left),
            width  = this.saferange[1] - this.saferange[0],
            leftb  = midb - (width * 0.5),
            rightb = midb + (width * 0.5);

        if( leftb < 0 ){
            leftb  = 0;
            rightb = width;
        } else if ( rightb > this.totalrange[1] ){
            rightb = this.totalrange[1];
            leftb  = rightb - width;
        }
        
        this.saferange[0] = leftb;
        this.saferange[1] = rightb;
    },
    scrubRight : function (left) {
        var rightb = this.xscale.reverse(left),
            leftb  = this.saferange[0],
            oldrb  = this.saferange[1],
            max    = this.totalrange[1];
        
        this.saferange[1] = (function () { 
            var over   = rightb > max,
                close  = (rightb - leftb) <= 0,
                result = rightb;
            
            if (over) { result = max; }
            if (close) { result = leftb; }
                        
            return result;
        })();
        
        
        return true;
    },
    scrubLeft : function (left) {
        var leftb  = this.xscale.reverse(left),
            rightb = this.saferange[1],
            oldlb  = this.saferange[0],
            max    = this.totalrange[0];
        
        this.saferange[0] = (function () { 
            var over   = leftb < max,
                close  = (rightb - leftb) <= 0,
                result = leftb;
            
            if (over) { result = max; }
            if (close) { result = rightb; }
                        
            return result;
        })();
        
        return true;
    },
    updateRange : function (evt) {
        var part  = this.active.attr("data-node"),
            left  = evt.pageX - this.container.offsetLeft,
            success;
            
        switch(part) {
            case "rect":
                success = this.scrubRect(left);
                break;
            case "right": 
                success = this.scrubRight(left);
                break;
            case "left": 
                success = this.scrubLeft(left);
                break;
            default:
                break;       
        }
        
        if( success !== false ) {
            this.updateParts();
        }
    },
    updateParts : function ( ) {
        var leftPos    = this.xscale( this.saferange[0] ),
            rightPos   = this.xscale( this.saferange[1] ),
            width      = rightPos - leftPos,
            leftTrans  = Metric.boundTransform(leftPos),
            rightTrans = Metric.boundTransform(rightPos);
        
        this.scrubber.attr({
            "x"     : leftPos,
            "width" : width  
        });
        
        this.rightBound.attr({
            "transform" : rightTrans
        }).textnode.text(this.saferange[1].toFixed(0));
        
        this.leftBound.attr({
            "transform" : leftTrans
        }).textnode.text(this.saferange[0].toFixed(0));
    }
};

/* add prototype to object used with init */
Metric.prototype.init.prototype = Metric.prototype;

document.addEventListener && 
window.addEventListener("load", onReady, false) && 
document.addEventListener( "DOMContentLoaded", onReady, false);

document.attachEvent &&
document.attachEvent( "onreadystatechange", onReady) &&
window.attachEvent( "onload", onReady);
    

return zPlots;    

})( window , [
    {
        name       : "HDL",  
        features   : {     
            totalrange : [0,60],
            saferange  : [50,60]
               }
    },
    {   
        name       : "LDL",     
        features   : {   
            totalrange : [0,180],
            saferange  : [0,100]
        }
    }
]);