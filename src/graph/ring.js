import "component"

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class. Will be used as a
// "Component" during update and draw calls

// RingFacotry
function RingFactory( publicScope ) {
    
    publicScope.Draw = function( ) {
        if( !this.ready )
            return false;
        
        var transform = this.locals.GetComponent('transform'),
            device = this.locals.device;
        
        if( !transform )
            return console.error('was unable to access the transform component');
        
        var position = transform.position,
            scale = transform.scale,
            outerRadius = this.outerRadius * scale,
            innerRadius = this.innerRadius * scale;
    
        console.log( innerRadius );
            
        // draw the outer circle first
        device.beginPath( );
        device.arc( position.x, position.y, outerRadius, 0, Math.PI * 20 );
        device.fillStyle = "#333";
        device.fill( );
        
        // draw the outer circle first
        device.beginPath( );
        device.arc( position.x, position.y, innerRadius, 0, Math.PI * 20 );
        device.fillStyle = "#fff";
        device.fill( );
        
        
    };

};

RingFactory['constructor'] = function( ) {
    this.innerRadius = DEFAULTS['HGRAPH_INNER_RADIUS'];  
    this.outerRadius = DEFAULTS['HGRAPH_OUTER_RADIUS'];
};

// create the Ring constructor from the component factory
hGraph.Graph.Ring = hGraph.Graph.ComponentFacory( RingFactory );