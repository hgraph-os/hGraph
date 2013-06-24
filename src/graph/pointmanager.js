import "component"

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    function CalcPointIncrement( ) {
        var amt = this.points.length,
            inc = ( this.maxDegree - this.minDegree ) / amt;
        return inc;
    };
    
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
        
    proto.AddPoint = function( data ) { 
        // create the point
        var point = new hGraph.Graph.Point( data );
        // make sure the point knows what his index is
        point.index = this.points.length;
        // expose this manager to the point so it will be able to calc it's degree
        point.manager = this;
        // add the point to the manager's 'points' array
        this.points.push( point );
        // return the point for local storage
        return point;
    };
    
    proto.PostInitialize = function( ) { 
        // update the manager's 'pointIncrement' property
        this.pointIncrement = CalcPointIncrement.call( this );
        
        // initialize the points with the local variable hash
        for( var i = 0; i < this.points.length; i++ )
        	this.points[i].Initialize( this.locals );  
    };

};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( ) {
    // initialize everything to 0
    this.points = [ ];
    this.pointIncrement = 0;
    this.minDegree = 0;
    this.maxDegree = 360;
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );