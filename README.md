hGraph
========

An open source javascript-based web application for visualizing health data.

###About the REPO###

The hGraph is an open source project that is being developed and designed to provide an industry standard of presenting health care information to professionals and average citizens alike.


###Dependencies###

The `HGraph` class relies on [d3.js](http://d3js.org/), which is a very popular javascript library for manipulating SVG, specficically for graphs and data plotting.

Once you have downloaded the latest version, you will need to include in in your html above the `HealthGraph` source code:

	<script src="/path/to/your/d3.js" type="text/javascript"></script>
	<script src="/path/to/your/HealthGraph.js" type="text/javascript"></script>
 
###Setup###

During a `window.onload` or similar entry point, the health graph is constructed and intialized by:
	
	var graph;
	window.onload = function(){
		
		graph = new HGraph({
			container : document.getElementById("graph_container"),
			userdata  : {
							overallScore : 90,
							factors      : 
							[
								{
									label : 'Family History',
									score : 80,
								},
								{
									label : 'Caloric Intake',
									score : 100
								}
							]
			};
		});
		
		graph.initialize();
		
	}


###More Info###

Please visit: [hgraph.org](http://hgraph.org/)

###License###

The `HGraph` class is licensed under the Apache-2.0 open source license. You can find more information on the Apache-2.0 license at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
