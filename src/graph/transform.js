import "component"

// hGraph.Graph.Transform
// the transform component

// TransformFactory
function TransformFactory( publicScope ) {
    
    publicScope.Move = function( xpos, ypos ) {
        this.position.x = xpos;
        this.position.y = ypos;
    };
    
};

// TransformFactory (constructor)
// this function will be used as the Transform object constructor. in order
// to populate some of the initial characteristics to starting values
TransformFactory['constructor'] = function( ) {

    // initialize everything with starting values
    this.size = { width : DEFAULTS['HGRAPH_WIDTH'], height : DEFAULTS['HGRAPH_HEIGHT'] };
    this.position = { x : ( this.size.width * 0.5 ), y : ( this.size.height * 0.5 ) };
    this.scale = 1;
    this.rotation = 0;
    
};

// create the constructor from the component factory
hGraph.Graph.Transform = hGraph.Graph.ComponentFacory( TransformFactory );