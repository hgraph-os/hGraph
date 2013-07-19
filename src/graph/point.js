import "component"
import "transform"
import "pointtext"

// hGraph.Graph.Point
// points 

// PointFactory
function PointFactory( proto ) {

    proto.Update = function( ) {    
        var graphTransform = this.locals.GetComponent('transform'),
            graphWeb = this.locals.GetComponent('web'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( this.score );
        
        // update the transform of this point
        this.transform.position.x = graphTransform.position.x + 
                                    Math.cos( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        this.transform.position.y = graphTransform.position.y + 
                                    Math.sin( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        
        // the point color will be updated
        this.pointColor = ( this.score < 66 && this.score > 33 ) 
                                ? HGRAPH_POINT_COLOR_HEALTHY
                                : HGRAPH_POINT_COLOR_UNHEALTHY;
        
        // add this point to the graph's web path if it needs to be drawn
        if( this.manager.drawFlag === true )
            graphWeb.AddPoint( this.transform );
        
        // update any children this point may have
        this.subManager.Update( );   
        // udpate the point's text
        this.text.Update( this.transform.rotation + graphTransform.rotation );
    };
    
    proto.Draw = function( ) {         
        var device = this.locals['device'];
        // set opacity based on point manager
        device.globalAlpha = this.manager.opacity;
        // draw the circle
        device.beginPath( );
        device.arc( this.transform.position.x, this.transform.position.y, this.radius, 0, Math.PI * 20 );
        device.fillStyle = this.pointColor;
        device.fill( );
        // draw the text for this point
        this.text.Draw( );
        // draw any sub points
        if( this.subManager.points.length > 0 )
        	this.subManager.Draw( );
    };
    
    proto.CheckBoundingBox = function( mx, my ) {
        var graphTransform = this.locals.GetComponent('transform'),
            distX = mx - this.transform.position.x,
            distY = my - this.transform.position.y,
            distA = ( distX * distX ) + ( distY * distY ),
            ownClick = distA < ( this.radius * this.radius ),
            childClick = this.subManager.CheckClick( mx, my );
            
        return ownClick || childClick;
    };
    
    proto.PostInitialize = function( ) {
        var manager = this.manager,
            dependencies = this.dependencies,
            subData, subPoint;
        
        // loop through the dependencies data and addd points into the sub manager
        while( subData = dependencies.pop( ) )
            subPoint = this.subManager.AddPoint( subData );
        
        // calculate the sub-manager's rotational degree information
        var start = manager.pointIncrement * this.index,
            end = start + manager.pointIncrement,
            subSpace = end - start,
            subInc = subSpace / ( this.subManager.points.length + 2 );
        // save the degree information
        this.subManager.minDegree = start + subInc;
        this.subManager.maxDegree = end - subInc;
        // initialize the sub manager, which initializes sub points
        this.subManager.Initialize( this.locals );
        this.text.Initialize( this.locals );
        // update this point's rotation value
        this.transform.rotation = ( this.manager.pointIncrement * this.index ) + this.manager.minDegree;
    };
          
};

PointFactory['constructor'] = function( config ) {  
    if( !config || !isObj( config ) )
        throw hGraph.Error('not enough information provided to create point');
    this.radius = HGRAPH_POINT_RADIUS;
    // grab values from the configuration
    this.score = toInt( config['score'] );
    // every point has a tranform to use
    this.transform = new hGraph.Graph.Transform( );
    // create the text from the configuration
    this.text = new hGraph.Graph.PointText( config );
    // create a sub manager in case of dependent points
    this.subManager = new hGraph.Graph.PointManager( true );
    // save an array of the dependent points
    this.dependencies = config.dependencies || [ ];    
    this.pointColor = "#333";
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );