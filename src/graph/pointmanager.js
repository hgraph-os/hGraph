import "component"

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    proto.Update = function( ) {
    
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Update( );
        
    };
    
    proto.Draw = function( ) {
    
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Draw( );
        
    };
    
    proto.addPoint = function( data ) {
        
    };
      
};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( ) {
    this.points = [ ];
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );