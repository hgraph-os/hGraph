import "component"

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class. Will be used as a
// "Component" during update and draw calls
hGraph.Graph.Ring = hGraph.Graph.Component(function( publicScope, privateScope ){ 
    
    privateScope.mouse = null;
    privateScope.transform = null;
    
    
    publicScope.Draw = function( device ) {
        var midX = DEFAULTS['HGRAPH_WIDTH'] * 0.5,
            midY = DEFAULTS['HGRAPH_HEIGHT'] * 0.5,
            scale = privateScope.transform.scale,
            xpos = privateScope.transform.position.x,
            ypos = privateScope.transform.position.y,
            cx = xpos + midX,
            cy = ypos + midY,
            innerRadius = ( DEFAULTS['HGRAPH_RADIUS'] - 20 ) * scale,
            outerRadius = ( DEFAULTS['HGRAPH_RADIUS'] + 20 ) * scale;
            
        device.fillStyle = '#333';
        device.beginPath( );
        device.arc( cx, cy, outerRadius, 0, 360, false );
        device.fill( );
        
        device.fillStyle = '#fff';
        device.beginPath( );
        device.arc( cx, cy, innerRadius, 0, 360, false );
        device.fill( );
        
        
    };
    
    publicScope.Update = function( ) {
        
    };
     
});