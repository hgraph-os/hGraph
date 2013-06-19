describe("hGraph.Graph post-creation readyness tests", function( ) {
    
    var g;
    
    it("should not be ready without a config param", function( ) {
    
        g = new hGraph.Graph( );
        
        expect(g.ready).toBe(false);
    
    });
    
    var bads = [ 
        false, 
        { }, 
        { container : false },
        { container : { appendChild : { } } }, 
        /^regex$/, 
        function(){ },
        [ ]
    ];
    
    for( var i = 0; i < bads.length; i++ ) {
    
        var b = bads[i];
        it("should not be ready with a bag config param", function( ) {
            g = new hGraph.Graph(b);
            expect(g.ready).toBe(false);
        });
            
    }
        
    it("Graph.ready should be true with no config", function( ) {
        var d = document.createElement('div');
        g = new hGraph.Graph({container:d});
        expect(g.ready).toBe(true);
    });

});