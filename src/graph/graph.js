// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = (function( config ){ 

function InternalDraw( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent( 'transform' );
    locals.device.clearRect( 0, 0, transform.size.width, transform.size.height );
    
    // loop through all components and draw them
    var components = locals['components'], name;
    for( name in components )
        components[name].Draw( );
    
};

function InternalUpdate( locals ) {
    if( !this.ready )
        return false;
    
    var transform = locals.GetComponent('transform');
        
    // update the scale
    var minRange = DEFAULTS['HGRAPH_RANGE_MINIMUM'] * locals.GetComponent('transform').scale,
        maxRange = DEFAULTS['HGRAPH_RANGE_MAXIMUM'] * locals.GetComponent('transform').scale;
        
    locals.scoreScale.range([ minRange, maxRange ]);    
    
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
    
    if( evt['touches'] )
        evt = evt['touches'][0];
        
    locals['mouse'].currentPositon.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].currentPositon.y = evt.pageY - locals['container'].offsetTop;
    
    var dx = locals['mouse'].currentPositon.x - locals['mouse'].lastPosition.x,
        dy = locals['mouse'].currentPositon.y - locals['mouse'].lastPosition.y;
    
    if( locals['mouse'].isDown ) {
        var transform = locals.GetComponent('transform');
        transform.scale += dy / 100;
        if( transform.scale < 1.0 ) transform.scale = 1.0;
        transform.rotation += dx;
    }    
    
    locals['mouse'].lastPosition.x = locals['mouse'].currentPositon.x;
    locals['mouse'].lastPosition.y = locals['mouse'].currentPositon.y;
    
    evt.preventDefault && evt.preventDefault( );
    
    // mouse move is an event where we need to update, add it to the queue and execute
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseUp( locals, evt ) {
    if( !this.ready )
        return false;
    
    locals['mouse'].isDown = false;
    
    return evt.preventDefault && evt.preventDefault( );
};

function InternalMouseDown( locals, evt ) {
    if( !this.ready )
        return false;
        
    if( evt['touches'] )
        evt = evt['touches'][0];
    
    locals['mouse'].lastPosition.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].lastPosition.y = evt.pageY - locals['container'].offsetTop;
    
    locals['mouse'].isDown = true;
    
    return evt.preventDefault && evt.preventDefault( );

};

function InternalZoom( locals ) {    
    var transform = locals.GetComponent('transform');
    
    // increate the scale (zooming in)
    transform.scale = ( this.zoomed ) ? 1.0 : 2.0;
    transform.position.x = ( this.zoomed ) ? transform.size.width / 2.0 : 0.0;
    
    this.zoomed = !this.zoomed;
    
    // execute the new stack
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalClick( locals, evt ) {
    
    var clickX = evt.pageX - locals['container'].offsetLeft,
        clickY = evt.pageY - locals['container'].offsetTop,
        pointManager = locals.GetComponent('pointManager');
    
    if( pointManager.CheckClick( clickX, clickY ) )
        return this.invokeQueue.push( inject( InternalZoom, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;
    
    // add points to the point manager
    var pointManager = locals.GetComponent('pointManager'),
        healthPoints = locals['payload'].points;
    for( var i = 0; i < healthPoints.length; i++ )
        healthPoints[i] = pointManager.AddPoint( healthPoints[i] );
    
    // loop through all components and initialize them
    var components = locals['components'], name;
    for( name in components )
        components[name].Initialize( locals );
    
    // set default graph text properties
    locals['device'].font = DEFAULTS['HGRAPH_CANVAS_TEXT'];
    locals['device'].textAlign = DEFAULTS['HGRAPH_CANVAS_TEXTALIGN'];
    
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalResize( locals ) {
    var transform = locals.GetComponent('transform');

    transform.size.width = window.innerWidth;
    transform.size.height = window.innerHeight;  
    
    $( locals.canvas )
        .attr( 'width', transform.size.width )
        .attr( 'height', transform.size.height );
    
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
    _components['web'] = new hGraph.Graph.Web( );
    _components['pointManager'] = new hGraph.Graph.PointManager( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        device : _device,
        mouse : _mouse,
        components : _components,
        scoreScale : d3.scale.linear( )
                        .domain([0,100])
                        .range([ DEFAULTS['HGRAPH_RANGE_MINIMUM'], DEFAULTS['HGRAPH_RANGE_MAXIMUM'] ])
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
        MouseUp = inject( InternalMouseUp, [ locals ], this ),
        CheckClick = inject( InternalClick, [ locals ], this )
        Resize = inject( InternalResize, [ locals ], this );
            
    $( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp )
        .bind( 'click', CheckClick );
    
    $( document )
        .bind( 'mouseup', MouseUp )
        .bind( 'touchstart', MouseDown )
        .bind( 'touchend', MouseUp )
        .bind( 'touchmove', MouseMove );
     
    window.onresize = Resize;
    
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
    this.zoomed = false;
    
    // the invoke queue starts with initialization 
    this.invokeQueue = [ inject( InternalInitialize, [ locals ], this ) ];
    
};

Graph.prototype = {
        
    constructor : Graph,    
    
    Initialize : function( ) {
        if( this.ready )
            this.ExecuteQueue( );
        
        window.Resize( );
    },
    
    ExecuteQueue : function( ) {
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};

return Graph;

})( );