import "component"

// hGraph.Graph.Point

// PointFactory
function PointFactory( proto ) {
        
    proto.Draw = function( ) {
        
    };
        
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );