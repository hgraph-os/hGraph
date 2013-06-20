import "shortcuts"

// createUID
// returns a new unique identifier string to be used in hashes
// @returns {string} a unique identifier that is useable on the client-side
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return "uid-" + (++uid);
    });
})( );


// inject
// creates a function that calls the function being passed in as the first 
// parameter with references to the specific objects that are passed in as the second
// @param {function} the function that will be used
// @param [array] the parameters that should be used in the new function
// @param {self} the context (if any) to use when calling 'apply' on the function
// @returns {function} a new function that calls the parameter function with the appropriate params and context
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

// forEach
// iterates over an object or array, calling the iterator function with 
// the context and key,value pair of the current element in the iteration
// @param {object|array} the array/object that is going to be looped over
// @param {function} the function to loop over
// @param {context} what the 'this' should be while looping
var forEach = function(obj, iterator, context) {
    var key;
    if (obj) {
        if( isFn(obj) ) {
            for (key in obj) {
                if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
    	} else if (isArr(obj)) {
    	    for (key = 0; key < obj.length; key++) { 
    	        iterator.call(context, obj[key], key);
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
};

var extend = function( dest ) {

    forEach( splice.call( arguments, 1 ), function( obj ){
        forEach( obj, function( value, key ){
    	    dest[key] = value;
        });
    });

}


