import "component"
import "transform"

// hGraph.Graph.PointText
// points 

// PointFactory
function PointTextFactory( proto ) {
    
    function GetFullText( ) {
        var str = this.name;
        if( this.value && this.value !== "")
            str += " " + this.value;  
        if( this.units && this.units !== "")
            str += " (" + this.units + ")";
        return str;
    };
    
    function GetShortText( ) {
        return this.name;  
    };
    
    proto.Update = function( rotation ) {
        var graphTransform = this.locals.GetComponent('transform'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( 110 );
        
        // update the transform of this point
        this.transform.position.x = Math.cos( toRad( rotation ) ) * dist;
        this.transform.position.y = Math.sin( toRad( rotation ) ) * dist;
                                    
        this.text = graphTransform.scale > 1.5 
                        ? GetFullText.call( this )
                        : GetShortText.call( this );
    };
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            graphTransform = this.locals.GetComponent('transform');
        
        if( this.transform.position.x > 40 * graphTransform.scale ) 
            device.textAlign = 'start';
        else if( this.transform.position.x < -(40 * graphTransform.scale) )
            device.textAlign = 'end';
        else
            device.textAlign = 'center';
        
        var xpos = graphTransform.position.x + this.transform.position.x,
            ypos = graphTransform.position.y + this.transform.position.y;
            
        device.fillText( this.text, xpos, ypos );
    };
      
};

PointTextFactory['constructor'] = function( config ) {
    if( !config )
        return false;
        
    this.name  = config['name'];    
    this.units = config['units'];
    this.value = config['value'];
    this.healthyRange = config['healthyRange']; 
    this.text = this.name;
    
    this.transform = new hGraph.Graph.Transform( );   
};

// create the constructor from the component factory
hGraph.Graph.PointText = hGraph.Graph.ComponentFacory( PointTextFactory );