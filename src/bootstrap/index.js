var graphInstances = { };

// hGraphInit 
// at this point, the app has been bootstrapped and is ready to initialize
// the individual graphs it has found on the page
function hGraphInit( ) {
    
};

// hGraphBootstrap
// searches the dom for the triggers that are required for the hgraph
// application. if the application trigger on the page somewhere, the 
// initialization function is called
function hGraphBootstrap( ) {
    jQuery( DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] ).each(function(indx,trigger) {
        if( jQuery("["+trigger+"]").length > 0 )
            hGraph.hRootElement = jQuery("["+trigger+"]").first( );
    });
    if( hGraph.hRootElement )
        return hGraphInit( );
};

jQuery( document ).ready( hGraphBootstrap );