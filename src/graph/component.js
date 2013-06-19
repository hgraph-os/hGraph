import "graph";

// hGraph.Graph.Component
// creates 
hGraph.Graph.Component = function( factory ) {
    // create the public scope object 
    var publicScope = { },
        privateScope = { };
        
    // allow the factory function to change the public scope (by reference)
    factory( publicScope, privateScope );
    // create the constructor for this component
    function Component( ) { };
    
    // Component.Initialize 
    // 
    Component.prototype.Initialize = function( mouse, transform ) { 
        privateScope.mouse = mouse;
        privateScope.transform = transform;  
        
        if( privateScope.mouse && privateScope.transform )
            this.ready = true;
    };
    
    // extend the component's prototype with the modified scope
    jQuery.extend( Component.prototype, publicScope );
    // return the constructor to be used
    return Component;
};