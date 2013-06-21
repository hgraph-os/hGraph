// math functions
var ceil = Math.ceil;
var floor = Math.floor;
var toInt = function( num ) { return parseInt( num, 10 ); };
var toFloat = function( num ) { return parseFloat( num ); };

// array shortcuts
var slice = [ ].slice;
var push = [ ].push;
var splice = [ ].splice;

// obj shortcuts
var hasOwn = { }.hasOwnProperty;
var toStr = { }.toString;

// type-related functions
var type = (function( ) { 
    
    var types = [ "", true, 12, /^$/, [ ], function(){ }, { }, null ],
        str, results = { };
        
    while( types.length > 0 ) { 
        str = toStr.call( types.pop( ) );
        results[str] = str.replace(/^\[object\s(.*)\]$/,"$1").toLowerCase( );
    }
    
    return (function( thing ) {
        return results[ toStr.call( thing ) ];  
    });
    
})( );

var isArr = function( thing ) { return type(thing) === "array"; };
var isStr = function( thing ) { return type(thing) === "string"; };
var isFn = function( thing ) { return type(thing) === "function"; };
var isDef = function( thing ){ return type(thing) !== undefined; };
var isUndef = function( thing ) { return !isDef( thing ); };
