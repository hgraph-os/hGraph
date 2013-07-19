import "component"

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    function CalculatePointIncrement( ) {
        var amt = this.points.length,
            inc = ( this.maxDegree - this.minDegree ) / amt;
        return inc;
    };
    
    proto.CheckClick = function( mx, my ) {
        for( var i = 0; i < this.points.length; i++ )
            if( this.points[i].CheckBoundingBox( mx, my ) ) return true;
    };
    
    proto.Update = function( ) { 
        var transform = this.locals.GetComponent('transform');
        this.opacity = ( this.subFlag ) ? abs( 0.5 - transform.scale ) : 1.0;
        this.drawFlag = this.opacity > 0 ? true : false;
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
        
        // if this is a sub-point list, make this dot smaller
        if( this.subFlag )
            point.radius = HGRAPH_SUBPOINT_RADIUS;
            
        // add the point to the manager's 'points' array
        this.points.push( point );
        
        // return the point for local storage
        return point;
    };
    
    proto.PostInitialize = function( ) { 
        // update the manager's 'pointIncrement' property
        this.pointIncrement = CalculatePointIncrement.call( this );
        
        // initialize the points with the local variable hash
        for( var i = 0; i < this.points.length; i++ )
        	this.points[i].Initialize( this.locals );  
    };

};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( subManagerFlag ) {
    // initialize everything to 0
    this.points = [ ];
    this.pointIncrement = 0;
    this.minDegree = 0;
    this.maxDegree = 360;
    this.subFlag = ( subManagerFlag === true ) ? true : false;
    this.drawFlag = true;
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );