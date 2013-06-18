// shortcuts to basic math ceil
var ceil = Math.ceil;
var floor = Math.floor;

// createUID
// returns a new unique identifier string to be used in hashes
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return ceil( Math.random( ) * 1000 ).toString(16) + (++uid);
    });
})( );