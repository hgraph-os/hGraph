import "component"

// hGraph.Graph.Point

// PointFactory
function PointFactory( proto ) {
    
    proto.Update = function( ) {    
        // update any sub points
        this.subManager.Update( );  
    };
    
    proto.Draw = function( ) {     
        
        if( !this.ready )
            throw hGraph.Error('the point was not ready to draw');
     
        var transform = this.locals.GetComponent('transform'),
            manager = this.manager,
            device = this.locals['device'],
            position = transform.position,
            rotation = transform.rotation,
            radius = DEFAULTS['HGRAPH_POINT_RADIUS'] * transform.scale,
            pointAngle = ( this.index * manager.pointIncrement ) + manager.minDegree,
            radians = toRad( rotation + pointAngle ),
            hypotenuse = transform.GetScaledValue( this.value ),
            xpos = position.x + Math.cos( radians ) * hypotenuse,
            ypos = position.y + Math.sin( radians ) * hypotenuse;
        

        // draw the outer circle first
        device.beginPath( );
        device.arc( xpos, ypos, radius, 0, Math.PI * 20 );
        device.fillStyle = this.pointColor;
        device.fill( );
        
        // draw anything else needed
        this.subManager.Draw( );
        
    };
    
    proto.PostInitialize = function( ) {
        
        var subManager = this.subManager,
            manager = this.manager,
            dependencies = this.dependencies,
            subData, subPoint;
        
        if( !isArr( dependencies ) )
            return false;
        
        while( subData = dependencies.pop( ) ){ 
            subPoint = subManager.AddPoint( subData );
            subPoint.pointColor = "#336633";
        }
        
        var start = manager.pointIncrement * this.index,
            end = start + manager.pointIncrement,
            subSpace = end - start,
            subInc = subSpace / ( subManager.points.length + 2 );
        
        subManager.minDegree = start + subInc;
        subManager.maxDegree = end - subInc;
    
        subManager.Initialize( this.locals );
              
    };
          
};

PointFactory['constructor'] = function( config ) {  
    if( !config )
        return false;
        
    // initialize variables
    this.name = config['name'];
    this.pointColor = "#333";
    this.theta = 0;
    // grab values from the configuration
    this.healthyRange = config['healthyRange'];
    this.score = config['score'];
    this.units = config['units'];
    this.value = config['value'];
    // create a sub manager in case of dependent points
    this.subManager = new hGraph.Graph.PointManager( );
    // save an array of the dependent points
    this.dependencies = config.dependencies;    
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );