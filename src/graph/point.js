import "component"

// hGraph.Graph.Point

// PointFactory
function PointFactory( proto ) {
        
    proto.Draw = function( ) {      
        var transform = this.locals.GetComponent('transform'),
            position = transform.position,
            rotation = transform.rotation;
            
        console.log( position.x );
    };
        
};

PointFactory['constructor'] = function( config ) {  
    this.name = config.name;
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );