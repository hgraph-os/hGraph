import "component"

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class. Will be used as a
// "Component" during update and draw calls
hGraph.Graph.Ring = hGraph.Graph.Component(function( publicScope ){ 


    publicScope.Initialize = function( uid, device, transform, mouse ) {
        
        this.Draw = inject(function( uid ) {
            
            console.log(" drawing uid - " + uid );
            
        }, [ uid, device, transform, mouse ]);
        
    
        this.Update = inject(function( uid ) {
            
            
        }, [ uid, device, transform, mouse ]);
        
    };
     
});