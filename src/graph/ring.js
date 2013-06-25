import "component"

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class.

// RingFactory
function RingFactory( proto ) {
    
    proto.Draw = function( ) {
        // get the graph's transform and device components
        var transform = this.locals.GetComponent('transform'),
            device = this.locals.device,
            scoreScale = this.locals.scoreScale;
        
        device.globalAlpha = 1.0;
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(66), 0, Math.PI * 20 );
        device.fillStyle = DEFAULTS['HGRAPH_RING_FILL_COLOR'];
        device.fill( );
        
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(33), 0, Math.PI * 20 );
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