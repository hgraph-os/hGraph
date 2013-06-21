// a hash of parse functions used to aggregate all data into a a common format
var Parsers = { };

// Parsers.string
// used when the data being sent into the parse call is a string
// @param {string} the string to be converted to valid json/object format
// @returns {object} a formatted data object
Parsers.string = function( blob ) {
    // attempt to turn the string into json
    var json;
    try { 
        json = JSON.parse( blob );
    } catch( e ) {
        // throw an hgraph error if the call fails
        throw hGraph.Erorr('unable to parse the data string');
    }
    return Parsers['object']( json );
}; 

// Parsers.object
// called when the data being sent into the parse call is an object
// @param {object} the object that is to be checked for proper data information
// @param {object} a formatted data object
Parsers.object = function( blob ) {
    blob.formatted = true;
    return blob;
};

