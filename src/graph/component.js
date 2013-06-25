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
    var Component = (function( fn ) {
        // the returned function is used as the constuctor for all component
        // instances. it handles calling the constructor specific to the component
        // defined by the factory function, and setting up all important stuff
        return function( ) {
            fn.apply( this, splice.call( arguments, 0 ) );
        };
    })( hasOwn.call( factory, 'constructor') ? factory['constructor'] : function( ) { } );
    
    Component.prototype = {
        
        Initialize : function( locals ) {
            // all components are not ready till proven otherwise
            this.ready = false;            
            // save a reference to the local variables on this object
            this.locals = locals || false;
            // do not move forward if there is no locals information in this component
            if( !this.locals || !this.locals['uid'] )
                throw new hGraph.Error('the component was unable to initialize with the information provided');
            // call the post initialize method for any component-specific initialization
            return this.PostInitialize( );
        },
        
        // placeholder functions that are overridden during extension
        Draw : function( ) { },
        Update : function( ) { },
        PostInitialize : function( ) { }
        
    };
    
    // extend the component's prototype with the modified scope 
    extend( Component.prototype, proto );
    
    // return the constructor to be used
    return Component;
};