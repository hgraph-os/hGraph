function hCreateGraphContainer( ) {
    var container = document.createElement('div');
    container.setAttribute('hgraph-graph','');
    return container;    
};

// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.graph = function( config ){ 
    if( !config )
        return false;
    
    var uid = config.uid || createUID( ),
        container = config.container || hCreateGraphContainer( ),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        mouse = { x : 0, y : 0, isDown : false },
        position = { x : 0, y : 0 },
        scale = 1.0;
    
    // draw
    function draw( ) {
        // begin by clearing out the context
        context.clearRect( 0, 0, DEFAULTS['HGRAPH_WIDTH'], DEFAULTS['HGRAPH_HEIGHT'] );
        
        var cx = position.x + ( DEFAULTS['HGRAPH_WIDTH'] * 0.5 ),
            cy = position.y + ( DEFAULTS['HGRAPH_HEIGHT'] * 0.5 ),
            r1 = ( DEFAULTS['HGRAPH_RADIUS'] - 20 ) * scale,
            r2 = ( DEFAULTS['HGRAPH_RADIUS'] + 20 ) * scale;
        
        context.fillStyle = "#97be8c";
        context.beginPath( );
        context.arc( cx, cy, r2, 0, 2 * Math.PI );
        context.fill( );
        
        context.fillStyle = "#FFF";
        context.beginPath( );
        context.arc( cx, cy, r1, 0, 2 * Math.PI );
        context.fill( );
        
    };
     
    function internalInitialRender( ) {
        return draw( );  
    };
    
    function mouseMove( evt ) {
        // update the mouse object
        mouse.x = evt.pageX - container.offsetLeft - ( DEFAULTS['HGRAPH_WIDTH'] * 0.5 );
        mouse.y = evt.pageY - container.offsetTop - ( DEFAULTS['HGRAPH_HEIGHT'] * 0.5 );
        // if the mouse is flagged as down, move the ring
        if( mouse.isDown ){ 
            position.x = mouse.x;
            position.y = mouse.y;
            return draw( );
        }
    };
    
    function mouseDown( ) {
        mouse.isDown = true;  
        jQuery(document).bind( 'mouseup', mouseUp );
    };
    
    function mouseUp( ) {
        mouse.isDown = false; 
        jQuery(document).unbind( 'mouseup' );
    };
    
    function toggleZoom( ) {
        scale = ( scale === 1 ) ? 4.0 : 1.0;
        draw( );
    };
    
    function checkClick( evt ) {
        
    };
    
    container.appendChild( canvas );
    context.fillStyle = "#000";
    jQuery( canvas )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] )
        .bind( 'mousemove', mouseMove )
        .bind( 'mousedown', mouseDown )
        .bind( 'mouseup', mouseUp )
        .bind( 'click', checkClick );
            
    this.ready = true;
    return internalInitialRender( );
};

hGraph.graph.prototype = {
    constructor : hGraph.graph,
    ready : false
};