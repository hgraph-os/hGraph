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