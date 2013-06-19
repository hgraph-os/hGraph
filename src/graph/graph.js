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
        _device = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _transform = { 
            position : { x : 0, y : 0 },
            rotation : 0,
            scale : 1.0
        },
        _components = [ ];
    
    _components.push( new hGraph.Graph.Ring( ) );
    
    // InternalDraw
    // called whenever the canvas needs to be updated
    var InternalDraw = inject(function( components ) {
        
        console.log( 'drawing' );
        for( var i = 0; i < components.length; i++ )
            components[i].Draw( );
    
    }, [ _components ] );
    
    // InternalUpdate
    // calls any position/size adjustments especially during animation loops
    var InternalUpdate = inject(function( drawFn ) { 
        
        return drawFn( );
        
    }, [ InternalDraw ]);
     
    // InternalInitialize
    // 
    var InternalInitialize = inject(function( uid, components, device, mouse, transform ) {
        
        for( var i = 0; i < components.length; i++ )
            components[i].Initialize( uid, device, transform, mouse );
            
    }, [ _uid, _components, _device, _mouse, _transform ] );
    
    // MouseMove
    // event callback that is fired every time the mouse is moved while being over the
    // UI layer. If the mouse is down, it will update the transform object's position
    var MouseMove = inject(function( mouse, container, transform, updateFn ) {
        
        mouse.x = Math.random( );
        
        return InternalUpdate( );
        
    }, [ _mouse, _container, _transform, InternalUpdate ] );
    
    // MouseDown
    // callback function for mousedown events on the UI layer
    var MouseDown = inject(function( mouse ) {
        // the mouse is down, make sure the object knows it
        mouse.isDown = true;  
        
        jQuery(document).bind( 'mouseup', MouseUp );
        
    }, [ _mouse, MouseUp ]);
    
    // MouseUp
    // the mouse up event that is called on the UI layer of the UI layer
    var MouseUp = inject(function ( m ) {
        // toggle the mouse as no longer being down
        m.isDown = false; 
        // unbind mouse up - no longer needed
        jQuery(document).unbind( 'mouseup' );
        
    }, [ _mouse ]);
        
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
        .bind( 'mouseup', MouseUp );
    
    
    // flag the graph as being ready for initialization
    this.ready = true;
    
    //this.invokeQueue = [ InternalUpdate, InternalInitialize ];
    InternalInitialize( );
    InternalUpdate( );
};

hGraph.Graph.prototype = {
    // basic graph properties
    constructor : hGraph.graph,     
    
    // Initialize
    // if the graph is ready, this initialization function will
    // loop through the graph's 'invokeQueue' which is a list of 
    // initialization functions
    Initialize : function( ) { 
        
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
        
    }
    
};



