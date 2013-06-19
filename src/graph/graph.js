// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = function( config ){ 
    
    this.ready = false;
    
    if( !config )
        return false;
    
    // public: 
    this.invokeQueue = [ ];
    
    // private: ( _ )
    var _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _uiLayer = document.createElement('uiLayer'),
        _context = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _transform = { 
            position : { x : 0, y : 0 },
            rotation : 0,
            scale : 1.0
        },
        _components = [ ];

    // InternalUpdate
    // calls any position/size adjustments especially during animation loops
    function InternalUpdate( ) { 
        // loop through the components, updating them
        for( var i = 0; i < _components.length; i++ )
            _components[i].Update( );
            
        return InternalDraw( );
    };
    
    // InternalDraw
    // called whenever the canvas needs to be updated
    function InternalDraw( ) {
        // begin by clearing out the context
        _context.clearRect( 0, 0, DEFAULTS['HGRAPH_WIDTH'], DEFAULTS['HGRAPH_HEIGHT'] );
        
        // loop through the components, drawing them
        for( var i = 0; i < _components.length; i++ )
            _components[i].Draw( _context );
        
        
    };
     
    // InternalInitialize
    // 
    function InternalInitialize( ) {
        // create the components needed
        _components.push( new hGraph.Graph.Ring( ) );
        
        // initialize all components with access to the mouse and transform properties
        for( var i = 0; i < _components.length; i++ )
            _components[i].Initialize( _mouse, _transform );
                
        return InternalUpdate( );
    };
    
    function MouseMove( evt ) {
        // update the mouse object
        _mouse.x = evt.pageX - _container.offsetLeft - ( DEFAULTS['HGRAPH_WIDTH'] * 0.5 );
        _mouse.y = evt.pageY - _container.offsetTop - ( DEFAULTS['HGRAPH_HEIGHT'] * 0.5 );
        // if the mouse is flagged as down, move the ring
        if( _mouse.isDown ){ 
            _transform.position.x = _mouse.x;
            _transform.position.y = _mouse.y;
            return InternalUpdate( );
        }
    };
    
    function MouseDown( ) {
        _mouse.isDown = true;  
        jQuery(document).bind( 'mouseup', MouseUp );
    };
    
    function MouseUp( ) {
        _mouse.isDown = false; 
        jQuery(document).unbind( 'mouseup' );
    };
    
    function ToggleZoom( ) {
        _scale = ( _scale === 1 ) ? 4.0 : 1.0;
        return InternalUpdate( );
    };
    
    function CheckClick( evt ) {
        
    };
    
    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
        // add the ui div(layer) to the container
        _container.appendChild( _uiLayer );
    } catch( e ) {
        this.ready = false;
        return console.error('hGraph was unable to create a graph in the container');
    }
    
    jQuery( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] );
        
    jQuery( _uiLayer )
        .attr( 'hgraph-layer', 'ui' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp )
        .bind( 'click', CheckClick );
            
    // add the internal initialization to the invokeQueue
    this.invokeQueue.push( InternalInitialize );
    // flag the graph as being ready for initialization
    this.ready = true;
};

hGraph.Graph.prototype = {
    // basic graph properties
    constructor : hGraph.graph,     
    
    // Initialize
    // if the graph is ready, this initialization function will
    // loop through the graph's 'invokeQueue' which is a list of 
    // initialization functions
    Initialize : function( ) { 
        // do nothing if not ready
        if( !this.ready || !isArr( this.invokeQueue) )
            return false;
        
        var fn = null,
            queue = this.invokeQueue;

        // loop through the invokeQueue and call the functions
        while( fn = queue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};



