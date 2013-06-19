// createUID
// returns a new unique identifier string to be used in hashes
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return "uid-" + (++uid);
    });
})( );


// inject
// creates a function that will call 
var inject = function( fn, params ) {

    if( !isArr( params ) || !isFn( fn ) )
        return function( ) { };
        
    return function( ) {
        fn.apply( { }, params );
    };
    
};