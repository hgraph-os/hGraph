/*
File: HGraphMain.js

Description:
	Example main method and helper functions

Requires:
	d3.js
	hammer.js
	mustache.js

Authors:
	Michael Bester <michael@kimili.com>
	Ivan DiLernia <ivan@goinvo.com>
	Danny Hadley <danny@goinvo.com>
	Matt Madonna <matthew@myimedia.com>

License:
	Copyright 2012, Involution Studios <http://goinvo.com>

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	  http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var graph, transitionTime, transitionDelayTime;
var usermenu, userinfo;

/*
* Routine called on window resize
*/
function resize(){
	// redraw hGraph
	graph.width = Math.max(minWidth, $(window).width()); 
	graph.height = Math.max(minHeight-10, $(window).height()-10); 
	graph.redraw();

	// center user icons only when hGraph is not zoomed in
	if(!graph.isZoomedIn()) {
		usermenu.find('.user').each(function(){
			$(this).center();
		});
	}

	// center timeline horizontally if present
	var usertimeline = $('#user-timeline');
	usertimeline.css({ left : (userinfo.width() - usertimeline.width()) / 2  });
}

/*
* Jquery helper function to center elements vertically
*/
$.fn.center = function () {
    this.css("margin-top", Math.max(0, $(this).parent().height() - $(this).outerHeight())/2);
    return this;
}

/*
* Renders user hGraph
* 
* data : (object) hGraph-compatible health data format
* check hData.js for more info
*/
function renderHgraph(data){

	// initializes hGraph
    function initGraph(data) {
        // initialization of optional parameters
        var opts = {
            // svg container
            container: $("#viz").get(0),
            userdata: {
                hoverevents : true,
                factors: data
            },
            // custom ring size to support upper and lower user panels
            scaleFactors: {
                labels : { lower : 6, higher : 1.5},
                nolabels : { lower : 3, higher : 1}
            },
            // custom zoom in factor, higher compared to the usual 2.2
            zoomFactor : 3,

            // zoom callback to hide panels when zooming in
            zoominFunction : mu.users.hide,
            // zoom callback to show panels when zooming out
            zoomoutFunction : mu.users.show,
            // allow zoom actions
            zoomable : true,
            showLabels : true
        };
        graph = new HGraph(opts);

        // get viz layout
        var container = $('#viz');

        graph.width = container.width();
        graph.height = container.height() - 10;

        graph.initialize();
    }

    // transition if hGraph already exists
    if(graph) {
        d3.select('#viz svg').transition().duration(transitionTime+transitionDelayTime).style('opacity',0)
        .each("end", function() { 
            d3.select(this).remove();
            initGraph(data);
            d3.select('#viz svg').style('opacity',0);
            d3.select('#viz svg').transition().delay(transitionDelayTime+transitionTime).duration(transitionTime).style('opacity',1);
        });
    } 
    // render without transition on first run
    else {
        initGraph(data);
    }
};



/*
* Main function
*/
$(document).ready(function (){

	var container = $('#viz');
		minHeight = parseInt(container.css('min-height')),
		minWidth = parseInt(container.css('min-width'));

	// fetch metric file
	d3.json("data/metrics.json", function(metrics, error) {
		if (error) return;

		usermenu = $('#user-selection');
		userinfo = $('#user-info');

		// initializes data conversion routines and multiuser environment
		mu.data.initialize(metrics);
		mu.users.initialize({ usermenu : usermenu, userinfo : userinfo});

		/*
		* Prevents scrolling on ios
		*/
		//document.ontouchmove = function(e){ e.preventDefault(); }
			
		/*
		* Win resize function
		*/
		$(window).resize(resize);
   	});

});