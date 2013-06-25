import "component"

function WebFactory( proto ) {
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            point;
        
        device.globalAlpha = "0.1";
        device.fillStyle = '#000';
        device.beginPath( );
        // loop through points, adding their location to the current path
        while( point = this.path.pop( ) )
            device.lineTo( point.position.x, point.position.y );
            
        device.fill( );
        device.globalAlpha = "1.0";
    };
        
    proto.AddPoint = function( transform ) {
        this.path.push( transform );
    };
    
};

WebFactory['constructor'] = function( ) {
    this.path = [ ];  
};

// create the constructor from the component factory
hGraph.Graph.Web = hGraph.Graph.ComponentFacory( WebFactory );