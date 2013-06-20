import "graph";

// hGraph.Graph.ComponentFacory
// creates a constructor that will have a prototype with the 
// properies modified by the factory function being passed as 
// the parameter
hGraph.Graph.ComponentFacory = function( factory ) {

    // create the public scope object 
    var proto = { };
        
    // allow the factory function to change the public scope (by reference)
    factory( proto );
    
    // create the constructor for this component
    var Component = hasOwn.call( factory, 'constructor') ? factory['constructor'] : function( ) { };
    
    Component.prototype = {
        
        Initialize : function( locals ) {
            // all components are not ready till proven otherwise
            this.ready = false;            
            // save a reference to the local variables on this object
            this.locals = locals;
            // if we got a uid in the locals hash, we are good to go
            if( this.locals['uid'] )
                this.ready = true;
        },
        
        // placeholder functions that are overridden during extension
        Draw : function( ) { },
        Update : function( ) { }
        
    };
    
    // extend the component's prototype with the modified scope
    jQuery.extend( Component.prototype, proto );
    
    // return the constructor to be used
    return Component;
    
};