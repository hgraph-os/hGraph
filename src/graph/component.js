import "graph";

// hGraph.Graph.Component
// creates 
hGraph.Graph.Component = function( factory ) {

    // create the public scope object 
    var publicScope = { };
        
    // allow the factory function to change the public scope (by reference)
    factory( publicScope );
    
    // create the constructor for this component
    function Component( ) { };
    
    // extend the component's prototype with the modified scope
    Component.prototype = publicScope;
    
    // return the constructor to be used
    return Component;
    
};