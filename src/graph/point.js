import "component"

// hGraph.Graph.Point

// PointFactory
function PointFactory( proto ) {
    
    function DrawCircle( device ) {
        device.beginPath( );
        device.arc( this.transform.position.x, this.transform.position.y, this.radius, 0, Math.PI * 20 );
        device.fillStyle = this.pointColor;
        device.fill( );
    };
    
    function GetZoomedText( ) {
        return this.name + " (" + this.value + " " + this.units + ")";
    };
    
    function DrawText( device ) {
        
        var scoreScale = this.locals.scoreScale,
            graphTransform = this.locals.GetComponent('transform'),
            rotationRadians = toRad( this.transform.rotation + graphTransform.rotation ),
            textDist = scoreScale(110),
            relativeX = Math.cos( rotationRadians ) * textDist,
            relativeY = Math.sin( rotationRadians ) * textDist,
            absoluteX = graphTransform.position.x + relativeX,
            absoluteY = graphTransform.position.y + relativeY,
            displayText = graphTransform.scale > 1.0 ? GetZoomedText.call( this ) : this.name;
    
        if( relativeX < -30 )
            device.textAlign = 'end';
        else if( relativeX > 30 )
            device.textAlign = 'start';
        else
            device.textAlign = 'center';
            
        device.fillText( displayText, absoluteX, absoluteY );
    };
    
    proto.Update = function( ) {    
    
        var graphTransform = this.locals.GetComponent('transform'),
            graphWeb = this.locals.GetComponent('web'),
            scoreScale = this.locals.scoreScale,
            rotationRadians, pointDistance;
        
        // calculate the total rotation (including the graph's)
        rotationRadians = toRad( this.transform.rotation + graphTransform.rotation );
        // get the distance the point is away
        pointDistance = scoreScale( this.score );
        
        this.transform.position.x = graphTransform.position.x + Math.cos( rotationRadians ) * pointDistance;
        this.transform.position.y = graphTransform.position.y + Math.sin( rotationRadians ) * pointDistance;
        
        this.pointColor = ( this.score < 66 && this.score > 33 ) 
                                ? DEFAULTS['HGRAPH_POINT_COLOR_HEALTHY']
                                : DEFAULTS['HGRAPH_POINT_COLOR_UNHEALTHY'];
        
        if( this.manager.opacity > 0 )
            graphWeb.AddPoint( this.transform );
        
        this.subManager.Update( );   
    
    };
    
    proto.Draw = function( ) {     
        
        if( !this.ready )
            throw hGraph.Error('the point was not ready to draw');
        
        var device = this.locals['device'];
            
        // set opacity based on point manager
        device.globalAlpha = this.manager.opacity;
        // draw the outer circle first
        DrawCircle.call( this, device );
        // draw the text next
        DrawText.call( this, device );
        
    
        // update any sub points
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
        
        var subManager = this.subManager,
            manager = this.manager,
            dependencies = this.dependencies,
            subData, subPoint;
        
        while( subData = dependencies.pop( ) )
            subPoint = subManager.AddPoint( subData );
        
        var start = manager.pointIncrement * this.index,
            end = start + manager.pointIncrement,
            subSpace = end - start,
            subInc = subSpace / ( subManager.points.length + 2 );
        
        subManager.minDegree = start + subInc;
        subManager.maxDegree = end - subInc;
    
        subManager.Initialize( this.locals );
        
        // update this point's rotation value
        this.transform.rotation = ( this.manager.pointIncrement * this.index ) + this.manager.minDegree;
    
    };
          
};

PointFactory['constructor'] = function( config ) {  
    if( !config )
        return false;
        
    // initialize variables
    this.name = config['name'];
    this.theta = 0;
    this.radius = DEFAULTS['HGRAPH_POINT_RADIUS'];
    // grab values from the configuration
    this.healthyRange = config['healthyRange'];
    this.score = toInt( config['score'] );
    this.units = config['units'];
    this.value = config['value'];
    // every point has a tranform to use
    this.transform = new hGraph.Graph.Transform( );
    // create a sub manager in case of dependent points
    this.subManager = new hGraph.Graph.PointManager( true );
    // save an array of the dependent points
    this.dependencies = config.dependencies || [ ];    
    this.pointColor = "#333";
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );