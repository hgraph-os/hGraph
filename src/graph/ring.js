import "component"

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class. Will be used as a
// "Component" during update and draw calls
hGraph.Graph.Ring = hGraph.Graph.Component(function( publicScope ){ 
    
    publicScope.Draw = function( ) {
        console.log("drawing ring for graph: " + this.uid );
    };
    
    publicScope.Update = function( ) {
        
    };
     
});