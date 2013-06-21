import "component"

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    proto.Update = function( ) {
        // loop through the points, updating them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Update( );
    };
    
    proto.Draw = function( ) {
        // loop through the points, drawing them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Draw( );
    };
    
    proto.addPoint = function( data ) { 
        // create the point
        var point = new hGraph.Graph.Point( data );
        // make sure the point knows what his index is
        point.index = this.points.length;
        // add the point to the manager's 'points' array
        this.points.push( point );
        // return the point for local storage
        return point;
    };
    
    proto.Initialize = function( locals ) {
        // loop through the points, initializing them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Initialize( locals );
        
        console.log( this.points[0] );          
    };
    
};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( ) {
    this.points = [ ];
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );