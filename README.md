hGraph
========

An open source javascript-based web application for visualizing health data.

###About the REPO###

hGraph is the next generation of helth care information and data. 


###Dependencies###

The `HGraph` class relies on [d3.js](http://d3js.org/), which is a very popular javascript library for manipulating SVG, specficically for graphs and data plotting.

Once you have downloaded the latest version, you will need to include in in your html above the `HealthGraph` source code:

	<script src="/path/to/your/d3.js" type="text/javascript"></script>
	<script src="/path/to/your/HealthGraph.js" type="text/javascript"></script>
 
*Although it's not reqired, it might also help to include other libraries like [jQuery](http://jquery.com/) and [modernizr](http://modernizr.com/)*
 
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


###Example site###

To see a live demo, please visit: [goinvo.github.com/hGraph](http://goinvo.github.com/hGraph/)

###License###

The `HGraph` class is licensed under the Apache-2.0 open source license. You can find more information on the Apache-2.0 license at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
