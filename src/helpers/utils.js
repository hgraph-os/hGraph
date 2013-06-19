// createUID
// returns a new unique identifier string to be used in hashes
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return ceil( Math.random( ) * 2e10 ).toString(32) + (++uid);
    });
})( );