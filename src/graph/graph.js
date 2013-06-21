// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = (function( config ){ 

function InternalDraw( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent( 'transform' )
    locals.device.clearRect( 0, 0, transform.size.width, transform.size.height );
    
    // loop through all components and draw them
    var components = locals['components'], name;
    for( name in components )
        components[name].Draw( );
    
};

function InternalUpdate( locals ) {
    if( !this.ready )
        return false;
    
    // loop through all components and update them
    var components = locals['components'], name;
    for( name in components )
        components[name].Update( );
        
    this.invokeQueue.push( inject( InternalDraw, [ locals ], this ) );
    return this.ExecuteQueue( );  
};

function InternalMouseMove( locals, evt ) {
    if( !this.ready )
        return false;
        
    locals['mouse'].currentPositon.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].currentPositon.y = evt.pageY - locals['container'].offsetTop;
    
    var dx = locals['mouse'].currentPositon.x - locals['mouse'].lastPosition.x,
        dy = locals['mouse'].currentPositon.y - locals['mouse'].lastPosition.y;
    
    if( locals['mouse'].isDown && locals.GetComponent('transform') )
        locals.GetComponent('transform').Move( dx, dy );
        
    locals['mouse'].lastPosition.x = locals['mouse'].currentPositon.x;
    locals['mouse'].lastPosition.y = locals['mouse'].currentPositon.y;
        
    // mouse move is an event where we need to update, add it to the queue and execute
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseUp( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].isDown = false;
};

function InternalMouseDown( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].lastPosition.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].lastPosition.y = evt.pageY - locals['container'].offsetTop;
    
    locals['mouse'].isDown = true;
        
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;
        
    // add points to the point manager
    var pointManager = locals.GetComponent('pointManager'),
        healthPoints = locals['payload'].points;
    for( var i = 0; i < healthPoints.length; i++ )
        healthPoints[i] = pointManager.addPoint( healthPoints[i] );
    
     // loop through all components and initialize them
    var components = locals['components'], name;
    for( name in components )
        components[name].Initialize( locals );
    
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function Graph( config ) {
    // while the graph is being prepared, it is not ready
    this.ready = false;
    
    // if no configuration was passed in for this graph, end    
    if( !config )
        return false;
    
    var // local references
        _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _device = _canvas.getContext('2d'),
        _mouse = { 
            currentPositon : {
                x : 0, 
                y : 0
            },
            lastPosition : {
                x : 0,
                y : 0
            },
            isDown : false
        },
        _components = { };
    
    // add the components that will make up this graph
    _components['transform'] = new hGraph.Graph.Transform( );
    _components['ring'] = new hGraph.Graph.Ring( );
    _components['pointManager'] = new hGraph.Graph.PointManager( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        device : _device,
        mouse : _mouse,
        components : _components
    };
    
    // GetComponent
    // a helper function that will return a component in the local component list based on a name
    // @param {string} the name of the component in the hash
    // @returns {object} a component that was created in the ComponentFactory
    locals.GetComponent = function( name ) {
        if( !this.components[name] )
            throw hGraph.Error('that component does not exist');
            
        return this.components[name];
    };

    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
    } catch( e ) {
        this.ready = false;
        throw hGraph.Error('unable to insert a graph canvas into the specified container');
    }
    
    
    var MouseMove = inject( InternalMouseMove, [ locals ], this ),
        MouseDown = inject( InternalMouseDown, [ locals ], this ),
        MouseUp = inject( InternalMouseUp, [ locals ], this );
    
    $( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp );
    
    // attempt to access payload data
    var payload = false;
    $( DEFAULTS['HGRAPH_PAYLOAD_TRIGGERS'] ).each(function(indx,trigger) {
        $( _container ).find('['+trigger+']').each(function( ) {
            if( this.value ) {
                payload = hGraph.Data.parse( this.value );
            }
        });
    });
    
    if( !payload || !payload.formatted || !payload.points )
        throw hGraph.Error('no payload information found for the graph');
    
    // if the payload object exists, it must be okay (save it)
    locals['payload'] = payload;

    // flag the graph as being ready for initialization
    this.ready = true;
    
    // the invoke queue starts with initialization 
    this.invokeQueue = [ inject( InternalInitialize, [ locals ], this ) ];
};

Graph.prototype = {
        
    constructor : Graph,    
    
    Initialize : function( ) {
        if( this.ready )
            this.ExecuteQueue( );
    },
    
    ExecuteQueue : function( ) {
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};

return Graph;

})( );