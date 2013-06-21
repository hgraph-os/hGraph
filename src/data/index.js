import "parsers"

hGraph.Data = function( ) { };
// Data.parse
// for the time being, the state of the data API is volitile, which means not
// having a pre-defined payload data 
// @param {object} an information blob that will be turned into useable data
hGraph.Data.parse = function( blob ) {
    var formatted = false;
    
    if( isStr( blob ) )
        formatted = Parsers['string']( blob );
    else if( isObj( blob ) )
        formatted = Parsers['object']( blob );
    else 
        return false;

    return formatted;
};