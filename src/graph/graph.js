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
        
    locals['mouse'].x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].y = evt.pageY - locals['container'].offsetTop;
    
    if( locals['mouse'].isDown && locals.GetComponent('transform') )
        locals.GetComponent('transform').Move( locals['mouse'].x, locals['mouse'].y );
        
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
    
    locals['mouse'].isDown = true;
        
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;

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
        _uiLayer = document.createElement('uiLayer'),
        _device = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _components = { };
    
    // add the components that will make up this graph
    _components['transform'] = new hGraph.Graph.Transform( );
    _components['ring'] = new hGraph.Graph.Ring( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        uiLayer : _uiLayer,
        device : _device,
        mouse : _mouse,
        components : _components
    };
    locals.GetComponent = function( name ) {
        return this.components[name] || false;
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
    
    
    var MouseMove = inject( InternalMouseMove, [ locals ], this ),
        MouseDown = inject( InternalMouseDown, [ locals ], this ),
        MouseUp = inject( InternalMouseUp, [ locals ], this );
    
    jQuery( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .attr( 'width', DEFAULTS['HGRAPH_WIDTH'] )
        .attr( 'height', DEFAULTS['HGRAPH_HEIGHT'] );
    
    // prep the ui layer and add events
    jQuery( _uiLayer )
        .attr( 'hgraph-layer', 'ui' )
        .bind( 'mousemove', MouseMove )
        .bind( 'mousedown', MouseDown )
        .bind( 'mouseup', MouseUp );
    
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

/*

return Graph;

    this.ready = false;
    
    if( !config )
        return false;
    
    // private:
    var _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _uiLayer = document.createElement('uiLayer'),
        _device = _canvas.getContext('2d'),
        _mouse = { x : 0, y : 0, isDown : false },
        _transform = { 
            position : { x : 0, y : 0 },
            rotation : 0,
            scale : 1.0,
            size : { 
                width : DEFAULTS['HGRAPH_WIDTH'],
                height : DEFAULTS['HGRAPH_HEIGHT']
            }
        },
        _components = [ ];
    
    // add the components that will make up this graph
    _components.push( new hGraph.Graph.Ring( ) );
    
    // InternalDraw
    // called whenever the canvas needs to be updated
    var InternalDraw = inject(function( device, components ) {
        
        // clear the canvas
        device.clearRect( 0, 0, DEFAULTS['HGRAPH_WIDTH'], DEFAULTS['HGRAPH_HEIGHT'] );
        
        for( var i = 0; i < components.length; i++ )
            components[i].Draw( );
    
    }, [ _device, _components ] );
    
    // InternalUpdate
    // calls any position/size adjustments especially during animation loops
    var InternalUpdate = inject(function( InternalDraw ) { 
        
        return InternalDraw( );
        
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
    var MouseMove = inject(function( mouse, container, transform, InternalUpdate, evt ) {
        
        if( !evt )
            return false;
        
        // update the mouse position
        mouse.x = evt.pageX - container.offsetWidth;
        mouse.y = evt.pageY - container.offsetHeight;
        
        // if dragging, update the position too
        if( mouse.isDown ) {
            transform.position.x = mouse.x + ( this.transform.size.width * 0.5 );
            transform.position.y = mouse.y + ( this.transform.size.height * 0.5 );
        }
    
        return InternalUpdate( );
        
    }, [ _mouse, _container, _transform, InternalUpdate ] );
    
    // MouseDown
    // callback function for mousedown events on the UI layer
    var MouseDown = inject(function( mouse ) {
        // the mouse is down, make sure the object knows it
        mouse.isDown = true;  
        // look on the entire document for mouse up events
        jQuery(document).bind( 'mouseup', MouseUp );
    }, [ _mouse, MouseUp ]);
    
    // MouseUp
    // the mouse up event that is called on the UI layer of the UI layer
    var MouseUp = inject(function ( mouse ) {
        // toggle the mouse as no longer being down
        mouse.isDown = false; 
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
    
    this.invokeQueue = [ InternalUpdate, InternalInitialize ];
};

hGraph.Graph.prototype = {
    // basic graph properties
    constructor : hGraph.graph,     
    
    // Initialize
    // if the graph is ready, this initialization function will
    // loop through the graph's 'invokeQueue' which is a list of 
    // initialization functions
    Initialize : function( ) { 
        if( !this.ready )
            return false;
            
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
*/
//})( );



