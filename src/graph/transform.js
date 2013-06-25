import "component"

// hGraph.Graph.Transform
// the transform component

// TransformFactory
function TransformFactory( proto ) {
    
    proto.Move = function( dx, dy ) {
        this.position.x += dx;
        this.position.y += dy;
    };
    
};

// TransformFactory (constructor)
TransformFactory['constructor'] = function( ) {
    // initialize everything with starting values
    this.size = { width : DEFAULTS['HGRAPH_WIDTH'], height : DEFAULTS['HGRAPH_HEIGHT'] };
    this.position = { x : ( this.size.width * 0.5 ), y : ( this.size.height * 0.5 ) };
    this.scale = 1;
    this.rotation = 0;
};

// create the constructor from the component factory
hGraph.Graph.Transform = hGraph.Graph.ComponentFacory( TransformFactory );