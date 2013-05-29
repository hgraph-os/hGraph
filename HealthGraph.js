/*global d3: true */
/*
File: HGraph.js

Description:
	Class for generating the Health Score Graphs

Requires:
	d3.js

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

/**
 *  Class: HGraph
 *      Sets up new HGraph instances
 */
var HGraph = function(opts) {
	this.container        = opts.container || null;
	this.context          = null;
	this.width            = opts.width || 0;
	this.height           = opts.height || 0;
	this.rotation         = opts.rotation || 0;
	this.zoomTime         = opts.zoomTime || 500;
	this.healthRange      = {
		lower : -30,
		upper : 30
	};

	// enables/disables zooming
	this.zoomable = opts.zoomable || false;

	// determine zoom level when hGraph is zoomed in
	this.zoomFactor       = opts.zoomFactor || 2.2;

	// zoomin callback
	this.zoominFunction	  = null || opts.zoominFunction;

	// zoomout callback
	this.zoomoutFunction  = null || opts.zoomoutFunction;

	// size of the ring relative to the image
	this.scaleFactors = opts.scaleFactors || {
		labels : { lower : 4, higher : 1.25},
		nolabels : { lower : 3, higher : 1}
	};

	// true when a transition is in progress
	this.transitioning = false;


	this.halfWidth        = 0;
	this.halfHeight       = 0;

	this.userdata         = opts.userdata || {};
	this.primaryIncrement = 1;

	this.showLabels   = opts.showLabels || false;
	this.isZoomed     = false;

	this.x = 0;
	this.y = 0;

	this.center       = null;
	this.originCoords = {
		x : 0,
		y : 0
	};
	this.layers       = {
		ring       : null,
		web        : null,
		text       : null,
		datapoints : null
	};
};


/**
 *  Function: HGraph.updateScales
 *  Updates scales and variables based on given width and height
 */
HGraph.prototype.updateDimensions = function() {

	this.width      = this.width || this.container.offsetWidth;
	this.height     = this.height || this.container.offsetHeight;
	this.halfWidth  = this.width / 2;
	this.halfHeight = this.height / 2;



	this.scaleRange = this.showLabels ?
						[this.halfHeight / this.scaleFactors.labels.lower, this.halfHeight / this.scaleFactors.labels.higher] :
						[this.halfHeight / this.scaleFactors.nolabels.lower, this.halfHeight / this.scaleFactors.nolabels.higher];

	this.center      = 'translate(' + this.halfWidth + ',' + this.halfHeight + ')';
	this.topleft     = 'translate(0,0)';

	this.scale       = d3.scale.linear().domain([-100,100]).range(this.scaleRange);
	
	this.originCoords.x = this.halfWidth;
	this.originCoords.y = this.halfHeight;

}

/**
 *  Function: HGraph.redraw
 *     redraws the graph
 */
HGraph.prototype.redraw = function() {
	// simply resize the svg if zoomed
	if (this.isZoomed) {
		this.updateDimensions();
		this.context.attr('width',this.width).attr('height',this.height);
	} 
	// do a complete initialization if unzoomed
	else 
	{
		this.destroy();
		this.initialize();
	}
}

/**
 *  Function: HGraph.destroy
 *     destroys the graph
 */
HGraph.prototype.destroy = function() {
	this.context.remove();
}

/**
 * Functon: HGraph.zeroGraph
 * 	redraws the graph with all scores = 0 and weights = 1
 */
HGraph.prototype.zeroGraph = function() {

	for(key in this.userdata.factors){
		this.userdata.factors[key].score = 0;
		this.userdata.factors[key].weight = 1;
	}
	this.redraw();
}

/**
 * Function: HGraph.updatePoint
 * 		updates a point on the graph
 * 
 *	id: Nubmer - Location of point within userdata.factors
 *	json: JSON OBject - properties to update within the point
 */
HGraph.prototype.updatePoint = function(id, json) {
	if (id === -1)
		return false;
	for(key in json){
		this.userdata.factors[id][key] = json[key];
	}
	this.redraw();
}

/**
 * Function: HGraph.getIdByLabel
 * 		returns the id of the first instance where userdata.factors.lable == name
 * 
 *	id: Nubmer - Location of point within userdata.factors
 *	json: JSON OBject - properties to update within the point
 */
HGraph.prototype.getIdByLabel = function(name) {
	for (id in this.userdata.factors){
		if(name === this.userdata.factors[id].label)
			return id
	}
	return -1
}

/**
 * Function: HGraph.findClosestPoint
 * 		return closes datapoint (circle) to given coordinates
 *		Note: the corodinate system is absolute (origin at top left)
 * 
 * x : (number) x coordinate
 * y : (number) y coordinate
 */
HGraph.prototype.findClosestPoint = function(x, y){
		halfWidth = $(this.context.node()).width()/2,
		halfHeight = $(this.context.node()).height()/2,
		distance = 9007199254740992,
		closest = null;

	$('circle').each(function(){
		var circleX = halfWidth + parseInt(d3.select(this).attr("cx")),
			circleY = halfHeight + parseInt(d3.select(this).attr("cy")),
			currentDistance = Math.abs(circleX - x) + Math.abs(circleY - y);
		if(currentDistance < distance) {
			distance = currentDistance;
			closestDatapoint = this;
		}
	});

	return closestDatapoint;
}


/**
 * Function: HGraph.
 * 		returns x and y coordinates of the center of a subsection
 *		
 * datapoint : (circle svg object) a datapoint
 */
HGraph.prototype.findSubsectionCenter = function(datapoint){


	var currentIndex = parseInt($(datapoint).attr('data-sortindex'));
		// get coordinates of current and next datapoint

	// center between current and next point
	// in case current point has a subsection
	if (this.userdata.factors[currentIndex].details) currentIndex += 0.5;

	// find radius for optimal value
	var optimalRadius = this.scale(this.healthRange.upper) - this.scale(this.healthRange.lower);
	angle = (this.primaryIncrement * currentIndex) * (Math.PI / 180);

	return {
		x : Math.cos(angle) * optimalRadius.toFixed(1)*this.zoomFactor,
		y : Math.sin(angle) * optimalRadius.toFixed(1)*this.zoomFactor
	};

}

/**
 *  Function: HGraph.initialize
 *     Sets up and draws the graph
 */
HGraph.prototype.initialize = function() {

	var layer, i, datapoint, web, touchstart, movedelta, that;

	that = this;

	this.updateDimensions();




	this.context     = d3.select(this.container)
	                      .append('svg')
	                      .attr('class','healthscore')
	                      .attr('width',this.width).attr('height',this.height);



	// Set up the layers
	for ( layer in this.layers ) {
		if (this.layers.hasOwnProperty(layer)) {
			this.layers[layer] = this.context.append('g')
	 		                         .attr('class','layer')
			                         .attr('data-layername', layer)
			                         .attr('transform', this.center);
		}
	}


	// Draw the ring around the user's health score
	this.ringpath = d3.svg.arc()
                 .startAngle(0)
                 .endAngle(360)
                 .innerRadius(this.scale(this.healthRange.lower))
                 .outerRadius(this.scale(this.healthRange.upper));

	this.ring = this.layers.ring.append('path').attr('d', this.ringpath).classed('ring',true);



	// and the score itself

	// score height ratio
	var scoreSize = this.layers.ring.node().getBBox().height/3.5;

	this.overalltxt = this.layers.text.append('text')
	                      .attr('class','overall')
	                      .attr('font-size', scoreSize)
	                      .text(this.calculateHealthScore());


	// Center the score
	this.overalltxt
		.attr('x', - (this.overalltxt.node().getBBox().width / 2))
		.attr('dy', '0.5ex');

	// Figure out how many points there should be
	this.primaryIncrement = 360 / this.userdata.factors.length || 1;

	// Add the datapoints.
	for (i = 0; i < this.userdata.factors.length; i++) {
		var weight = this.userdata.factors[i].weight || 1;
		this.userdata.factors[i].weight = weight;
		datapoint = this.userdata.factors[i];
		this.addPoint(datapoint, i);
	}

	// Create a web path and hook it up
	web = this.layers.web.append('path');
	this.updateWeb(false);
	web
		.attr('data-originalPath', web.attr('d')).classed('web',true)
		

	// Set up the dragability of the zoomed in graph
	touchstart = {
		x : 0,
		y : 0
	};
	moveDelta = {
		x : 0,
		y : 0
	};

	/*
	* 	Initialize hammer.js library to enable multitouch features
	*/
    var touches = Hammer(this.context.node());

    // multitouch pinch zoom features
    if(this.zoomable) {

    	// zoom-in pinch
	    touches.on('pinchout',
	    	function() {
	    		event.preventDefault();
	    		if (that.isZoomedIn()) return;
	    		// find closest datapoint to pinched area
				var closestDatapoint = that.findClosestPoint(event.gesture.center.pageX, 
															 event.gesture.center.pageY);
				// determine coordinates that will represent the new center
				var pathCenter = that.findSubsectionCenter(closestDatapoint);
	    		that.zoomIn(that.zoomFactor, pathCenter.x, pathCenter.y);
	    	}
	    );

	    // zoom-out pinch
	    touches.on('pinchin',
	    	function() {
	    		event.preventDefault();
	    		that.zoomOut();
	    	}
	    );
	}

	touches.on('touchstart', function(e){

		if(that.transitioning) return;

		var touch;

		if ( e.touches.length > 1) {
			return;
		}

		touch = e.touches[0];

		touchstart.x = touch.pageX;
		touchstart.y = touch.pageY;
	});

	touches.on('touchmove', function(e){

		if(that.transitioning || !that.isZoomedIn()) return;

		if ( e.touches.length > 1) {
			return;
		}

		var key, layer, delta, touch;

		e.preventDefault();

		touch = e.touches[0];
		delta = {
			x : touch.pageX - touchstart.x,
			y : touch.pageY - touchstart.y
		};

		// Get the new origin coordinates, clamping it to the containter size
		moveDelta.x = Math.max(0, Math.min(that.width, delta.x + that.originCoords.x));
		moveDelta.y = Math.max(0, Math.min(that.height, delta.y + that.originCoords.y));

		for ( key in that.layers ) {
			if (that.layers.hasOwnProperty(key)) {
				that.layers[key].attr('transform', 'translate(' + moveDelta.x + ', ' + moveDelta.y + ')');
			}
		}

	});

	touches.on('touchend', function(e){


		if(that.transitioning) return;


		that.originCoords.x = moveDelta.x;
		that.originCoords.y = moveDelta.y;
		console.log('ted')
	});

	$(this.container).bind('mousedown',function(e){

		that.dragging = true;
		this.pan = false;
		touch = e;
		touchstart.x = e.offsetX;
		touchstart.y = e.offsetY;

	});
	$(this.container).bind('mousemove',function(e){

		if(!that.dragging){ return; }

		// helps differenciate between drags and click
		// is the presence of a mousemove.
		this.pan = true;
		
		var key, layer, delta, touch;
		if ( ! that.isZoomedIn() ) {
			return;
		}

		touch = e;
		delta = {
			x : touch.offsetX - touchstart.x,
			y : touch.offsetY - touchstart.y
		};

		// Get the new origin coordinates, clamping it to the containter size

		moveDelta.x = Math.max(0, Math.min(that.width, delta.x + that.originCoords.x));
		moveDelta.y = Math.max(0, Math.min(that.height, delta.y + that.originCoords.y));

		for ( key in that.layers ) {
			if (that.layers.hasOwnProperty(key)) {
				that.layers[key].attr('transform', 'translate(' + moveDelta.x + ', ' + moveDelta.y + ')');
			}
		}
	});
	$(this.container).bind('mouseup',function(e){

		that.dragging = false;
		that.originCoords.x = moveDelta.x;
		that.originCoords.y = moveDelta.y;

		// click detected
		if(!this.pan) {
			that.zoomOut();
		}
	});


};

/**
 *  Function: HGraph.calculateScoreFromValue
 *     calculates score based on metrics
 *
 *  Arguments:
 *      features - *(JSON)* Contains the features to be measured against
 *      myValue - *(number)* Number to compare to features
 */
HGraph.prototype.calculateScoreFromValue = function (features, myValue){
	var maxHealthyValue = features.healthyrange[1];
	var minHealthyValue = features.healthyrange[0];
	var maxAcceptableValue = features.totalrange[1];
	var minAcceptableValue = features.totalrange[0];
	var healthyRangeMidPoint = (minHealthyValue + maxHealthyValue)/2.0;
	var score = 0;

	if ((myValue >= minHealthyValue)  && (myValue <= maxHealthyValue)){
		if((minHealthyValue === minAcceptableValue && myValue < healthyRangeMidPoint) || (maxHealthyValue === maxAcceptableValue && myValue > healthyRangeMidPoint) || (myValue == healthyRangeMidPoint)){
			score = 0;
		} else {
			score = 30 * ((myValue - healthyRangeMidPoint)/(maxHealthyValue - healthyRangeMidPoint))
		}
	} else if (myValue > maxHealthyValue){
		score = 70 * ((myValue-maxHealthyValue)/(maxAcceptableValue-maxHealthyValue)) + 30
		if(score > 100)
			score = 100;
	} else {
		score = -(70 * ((minHealthyValue-myValue)/(minHealthyValue-minAcceptableValue)) + 30)
		if (score < -100)
			score = -100;
	}

	return score;
}

/**
 *  Function: HGraph.panTo
 *     Centers the graph at the specified coordinates
 *
 *  Arguments:
 *      x - *(Number)* The x coordinate of the new center
 *		y - *(Number)* The y coordinate of the new center
 */
HGraph.prototype.panTo = function(x, y){

	var self = this;

	translateToPoint = function(x, y){
		return 'translate(' + x + ',' + y + ')';
	};

	for ( key in this.layers ) {
		if (this.layers.hasOwnProperty(key)) {
			layer = this.layers[key];
			layer.transition().ease('quad-out')
			.duration(this.zoomTime * 0.8)
			.each("end", function() { self.transitioning = false})
			.attr('transform', translateToPoint(this.halfWidth - x, this.halfHeight - y));
		}
	}
};

/**
 *  Function: HGraph.zoomIn
 *     Zooms the graph.
 *
 *  Arguments:
 *      zoomFactor - *(Number)* The factor you want to zoom in by. If omitted, the instance's default zoom factor is used.
 */
HGraph.prototype.zoomIn = function(zoomFactor, x, y) {


	// do not start zoom-in if transitioning
	if (this.transitioning ) return;

	// beginning the zoom-in transition
	this.transitioning = true;

	// zoom it at same coordinates if this is a redraw
	this.x = x || this.halfWidth/2;
	this.y = y || this.halfHeight/2;
	zoomFactor = zoomFactor || this.zoomFactor; // Allow zooming factor override.

	this.originCoords.x = this.halfWidth - this.x*zoomFactor;
	this.originCoords.y = this.halfHeight - this.y*zoomFactor;

	var key, i, j, factor, details, layer, labels, that, zoomedWebFillString, getZoomedRingPath, getZoomedX, getZoomedY, scoreRange;

	that = this;

	zoomedWebFillString = '';

	// simply pan to cliked location if we are already zoomed in
	if(this.isZoomed) {
		this.panTo(x*zoomFactor, y*zoomFactor);
		return;
	}

	// zoom callbacks
	if (this.zoominFunction) this.zoominFunction();

	getZoomedRingPath = function() {
		var zoomedRingPath, zoomedScale, zoomedScaleRange, i;

		zoomedScaleRange = [];
		for (i = 0; i < that.scaleRange.length; i++) {
			zoomedScaleRange.push(that.scaleRange[i] * zoomFactor);
		}
		zoomedScale = d3.scale.linear().domain([-100,100]).range(zoomedScaleRange);
		console.log(that.scaleRange);
		zoomedRingPath = d3.svg.arc()
		                     .startAngle(0)
		                     .endAngle(360)
		                     .innerRadius(zoomedScale(that.healthRange.lower))
		                     .outerRadius(zoomedScale(that.healthRange.upper));

		return zoomedRingPath;
	};

	getZoomedX = function() {
		var coords = JSON.parse(this.getAttribute('data-origcoords'));
		return coords.x * zoomFactor;
	};

	getZoomedY = function() {
		var coords = JSON.parse(this.getAttribute('data-origcoords'));
		return coords.y * zoomFactor;
	};

	setDetailText = function() {
		var metricValue = this.getAttribute('data-metricValue');
		return this.textContent + (metricValue === ''  ? '' : ' (' + this.getAttribute('data-metricValue') + ')');

	};


	translateToPoint = function(x, y){
		return 'translate(' + x + ',' + y + ')';
	};

	// Do the zooming.
	for ( key in this.layers ) {
		if (this.layers.hasOwnProperty(key)) {
			layer = this.layers[key];

			// Zoom the ring in.
			if ( key === 'ring' ) {
				layer.select('path')
					.transition().ease('elastic')
						.duration(this.zoomTime)
						.attr('d', getZoomedRingPath());
			// Do the datapoints
			} else if ( key === 'datapoints') {
				layer.selectAll('circle')
					.transition().ease('elastic')
						.duration(this.zoomTime)
						.attr('cx', getZoomedX)
						.attr('cy', getZoomedY);

				// And the labels
				if (this.showLabels) {
					labels = layer.selectAll('text');
					labels
						.transition().ease('elastic')
							.duration(this.zoomTime)
							.attr('x', getZoomedX)
							.attr('y', getZoomedY);


					window.setTimeout(function(){
						labels.text(setDetailText);
					}, this.zoomTime);
				}
			} else if ( key === 'web') {
				this.updateWeb(true, true);
			}

			// Move it to the new origin point.
			layer
				.transition().ease('quad-out')
				.duration(this.zoomTime * 0.8)
				.each("end", function() { that.transitioning = false})
				.attr('transform', translateToPoint(this.halfWidth - (this.x*zoomFactor), this.halfHeight - (this.y*zoomFactor)));

		}
	}



	window.setTimeout(function(){

		var web, secondaryPoints;

		for (i = 0; i < that.userdata.factors.length; i++) {
			factor = that.userdata.factors[i];
			if ( ! factor.details ) {
				continue;
			}
			for (j = 0; j < factor.details.length; j++) {
				details = factor.details[j];
				// get the score of the current and next parent node
				scoreRange = [
					factor.score,
					(that.userdata.factors[i + 1] ? that.userdata.factors[i + 1] : that.userdata.factors[0]).score
				];
				that.addPoint(
					details,
					j + 1,
					factor.angle,
					(that.primaryIncrement / (factor.details.length + 1) || 1),
					factor.details.length + 1,
					scoreRange,
					i,
					true
				);
			}
		}

		// Select all the secondary points.
		secondaryPoints = that.layers.datapoints.selectAll('.secondary');


		// Redraw the path to include the new elements and make a note of the path
		web = that.updateWeb(false);
		web.attr('data-secondaryStartingPath', web.attr('d'));

		// Remove the starting data point attribute
		secondaryPoints.attr('data-startingCoords', null);

		// Animate them to their proper values
		secondaryPoints
			.transition().ease('elastic')
				.duration(that.zoomTime)
				.attr('cx', getZoomedX)
				.attr('cy', getZoomedY);

		// And make the web follow suit
		that.updateWeb();

	}, this.zoomTime);
	
	this.isZoomed = true;
	
};

/**
 *  Function: HGraph.zoomOut
 *     Zooms the graph back to its original dimensions
 */
HGraph.prototype.zoomOut = function() {

	// do not start zoom-out if already transitioning
	if (this.transitioning || !this.isZoomed ) return;
	// beginning the zoom-out transition
	this.transitioning = true;

	var getOriginalX, getOriginalY, setDetailText, web;

	getOriginalX = function() {
		var coords = JSON.parse(this.getAttribute('data-origcoords'));
		return coords.x;
	};

	getOriginalY = function() {
		var coords = JSON.parse(this.getAttribute('data-origcoords'));
		return coords.y;
	};

	setDetailText = function(d) {
		return this.textContent.replace(/\s+\([^\)]*\)$/, '');
	};

	// zoom callbacks
	if (this.zoomoutFunction) this.zoomoutFunction();

	// Remove secondary points.
	this.layers.datapoints.selectAll('.secondary').remove();
	// Revert the web back to the previous path
	web = this.updateWeb(true, false, true);
	// Remove the secondarry starting path reference
	web.attr('data-secondaryStartingPath', null);

	window.setTimeout(function(that){
		var key, layer;

		// Revert the web to the primary points.
		that.updateWeb(false);

		// Loop through the layers and go back to the original state.
		for ( key in that.layers ) {
			if (that.layers.hasOwnProperty(key)) {
				layer = that.layers[key];

				// Zoom the ring out
				if ( key === 'ring' ) {
					layer.select('path')
						.transition().ease('quad-in-out')
							.duration(that.zoomTime)
							.attr('d', that.ringpath);
				// And the datapoints
				} else if ( key === 'datapoints') {
					// remove secondary points
					layer.selectAll('.secondary').remove();

					layer.selectAll('circle')
						.transition().ease('quad-in-out')
							.duration(that.zoomTime)
							.attr('cx', getOriginalX)
							.attr('cy', getOriginalY);

					// And the labels
					if ( that.showLabels ) {
						layer.selectAll('text')
							.transition().ease('quad-in-out')
								.duration(that.zoomTime)
								.text(setDetailText)
								.attr('x', getOriginalX)
								.attr('y', getOriginalY);
					}
				} else if ( key === 'web') {
					that.updateWeb(true, true, true, 'quad-in-out');
				}

				// Move the layer back to the center
				that.layers[key]
					.transition().ease('quad-in')
						.duration(that.zoomTime)
						.each("end", function() {that.transitioning = false})
						.attr('transform', that.center);
			}
		}
		that.isZoomed = false;
	}, 0, this);
	
};

/**
 *  Function: HGraph.isZoomedIn
 *     Tells you whether the graph is currently zoomed in or not.
 *
 *    Returns:
 *      *(Boolean)* true if the graph is currently zoomed in, otherwise false
 */
HGraph.prototype.isZoomedIn = function() {
	return this.isZoomed;
};

/**
 *  Function: addPoint
 *     Adds a data point to the graph
 *
 *  Arguments:
 *      datapont - *(Object)* A datapoint with score and label properties.
 *      index - *(Number)* An index (i.e. the loop index when looping through point data to add points)
 *      startingAngle - *(Number)* The angle where you begin calculating the X & Y coordinates to plot. Defaults to 0.
 *      increment - *(Number)* the number of degrees you want to increment from the previous point. Defaults to this.primaryIncrement
 *      steps - *(Number)* The number of datapoints in a datapoint array. Used when rendering zoomed in details.
 *      startingScoreRange - *(Array)* An array of two adjacent datapoint scores. Used to calculate starting coordinates for secondary points.
 *      klass - *(String)* A class name to add to the new point and point label.
 *      labelWithDetail - *(Boolean)* If you want the label to include the score or value, pass in true here.
 *
 *  Returns:
 *      *(Object)* A d3 selection with the point element that was appended to the graph.
 */
HGraph.prototype.addPoint = function(datapoint, index, startingAngle, increment, steps, startingScoreRange, sortIndex, labelWithDetail) {

	var point, secondary, angle, coords, radius, getPointColor, getTextAnchor, gotoPage, interstitialScore, startingDataValue, startingCoords, scoreDiff, scaledDataValue, labelPointScale, metricValue;

	var self = this;

	index = typeof index === 'number' ? index : 1;
	secondary = (startingScoreRange && startingScoreRange.constructor === Array);

	// Private utility functions to get the point color
	getPointColor = function(score) {
		return (score > this.scale(this.healthRange.lower) && score < this.scale(this.healthRange.upper) ) ? 'healthy' : 'unhealthy';
	};

	getTextAnchor = function(x) {
		x = parseInt(x, 10);
		if ( x >= -10 && x <= 10) {
			return 'middle';
		} else {
			return ( x > 0) ? 'start' : 'end';
		}

	};

	gotoPage = function() {
		var href = this.getAttribute('href');
		if ( ! href ) {
			return;
		}
		window.location.href = href;
	};

	clicked = function(){
		d3.event.stopPropagation();
		var pathCenter = self.findSubsectionCenter(this);
		self.zoomIn(self.zoomFactor, pathCenter.x,  pathCenter.y);
	};

	scaledDataValue = this.scale(datapoint.score);
	if ( secondary ) {
		scoreDiff = startingScoreRange[1] - startingScoreRange[0];
		interstitialScore = startingScoreRange[0] + ((scoreDiff / steps) * index);
		startingDataValue = this.scale(interstitialScore);
	}

	// Figure out where to place the point
	angle = ((increment || this.primaryIncrement) * index) + (startingAngle || 0);
	//console.log(angle);
	radian = angle * (Math.PI / 180);

	if ( startingDataValue ) {
		startingCoords = {
			x : (Math.cos(radian) * startingDataValue).toFixed(1),
			y : (Math.sin(radian) * startingDataValue).toFixed(1)
		};
	}

	coords = {
		x : (Math.cos(radian) * scaledDataValue).toFixed(1),
		y : (Math.sin(radian) * scaledDataValue).toFixed(1)
	};

	datapoint.angle = angle;
	datapoint.coords = coords;

	radius = Math.max(1, Math.min(10, Math.round(this.width / 80)));
	point = this.layers.datapoints.append('circle')
			.data([datapoint.score])
			.attr('r', secondary ? radius / 1.5 : radius)
			.attr('cx', (startingCoords ? startingCoords.x : coords.x) * (this.isZoomedIn() ? this.zoomFactor : 1))
			.attr('cy', (startingCoords ? startingCoords.y : coords.y) * (this.isZoomedIn() ? this.zoomFactor : 1))
			.attr('data-origcoords', JSON.stringify(coords))
			.attr('data-sortindex', typeof sortIndex === 'number' ? sortIndex + '.' + index : index)
			.classed(getPointColor.call(this, scaledDataValue), true);

	// allow point and zoom if graph is zoomable
	if(this.zoomable) {
		point.on("click", clicked);
		point.classed("clickable", true);
	}

	if ( startingCoords ) {
		point.attr('data-startingCoords', JSON.stringify(startingCoords));
	}

	// Note the secondary class as such
	if ( secondary ) {
		point.classed('secondary', true);
	}

	if ( this.showLabels ) {
		// Calculate the size of the datapoint radius (clamping it between 1 and 10)
		labelPointScale = Math.max(scaledDataValue + (radius * 3), this.scale(50));
		// Do the labels.
		labelCoords = {
			x : (Math.cos(radian) * labelPointScale).toFixed(1),
			y : (Math.sin(radian) * labelPointScale).toFixed(1)
		};

		// Are we zoomed in?
		if ( this.isZoomedIn() ) {
			labelCoords.x = labelCoords.x * this.zoomFactor;
			labelCoords.y = labelCoords.y * this.zoomFactor;
		}

		metricValue = datapoint.value || 100-Math.abs(datapoint.score);

		label = this.layers.datapoints.append('text')
				.text(datapoint.label + (labelWithDetail ? ' (' + metricValue + ')' : ''))
				.data([datapoint.score])
				.attr('class', 'label')
				.attr('x', labelCoords.x)
				.attr('y', labelCoords.y)
				.attr('data-origcoords', JSON.stringify(labelCoords))
				.attr('data-metricValue', datapoint.details ? '' : metricValue)
				.attr('text-anchor', getTextAnchor(coords.x))
				.attr('data-sortindex', typeof sortIndex === 'number' ? sortIndex + '.' + index : index)
				.classed(getPointColor.call(this, scaledDataValue), true);

		// allow point and zoom if graph is zoomable
		if(this.zoomable) {
			label.on("click", clicked);
			label.classed("clickable", true);
		}

		if ( secondary ) {
			label.classed('secondary', true);
		}

		// Hook up a link if it's there.
		if ( datapoint.link ) {
			point
				.attr('href', datapoint.link)
				.classed('linked', true)
				.on('click', gotoPage)
				.on('touchend', gotoPage);

			label
				.attr('href', datapoint.link)
				.classed('linked', true)
				.on('click', gotoPage)
				.on('touchend', gotoPage);
		}

		// Cascade the display of the labels.
		window.setTimeout(function(label){
			label.classed('visible', true);
		}, 60 * index, label);
	}

	return point;
};

/**
 *  Function: HGraph.updateWeb
 *     Updates the shadow that connects the dots on the web.
 *
 *  Arguments:
 *      animated - *(Boolean)* if true, the web animates to its new shape, otherwise it assumes the new shape immediately.
 *      forceZoomedState - *(Boolean)* if true, we assume that calculating the zoomed in state, otherwise it checks for the current zoom status.
 *      revertToOriginal - *(Boolean)* if true, the web reverts to the path saved in the data-secondaryStartingPath (if it exisits) or data-originalPath attribute. Otherwise, it calculates the path based on the datapoint positions.
 *
 *  Example:
 *  >
 *
 *    Returns:
 *      *(Object)* A d3 selection with the web path element.
 */
HGraph.prototype.updateWeb = function(animated, forceZoomedState, revertToOriginal, easing) {

	var that, calculateWebPathCoordinate, fillString, points, web;

	animated = typeof animated === 'boolean' ? animated : true;
	easing = typeof easing === 'string' ? easing : 'elastic';
	that = this;
	fillString = '';

	calculateWebPathCoordinate = function(d, i){
		var pointCoords, zoomedCoords;
		pointCoords = JSON.parse(this.getAttribute('data-startingCoords') || this.getAttribute('data-origcoords'));
		zoomedCoords = {
			x : (parseFloat(pointCoords.x) * (forceZoomedState || that.isZoomedIn() ? that.zoomFactor : 1)).toFixed(1),
			y : (parseFloat(pointCoords.y) * (forceZoomedState || that.isZoomedIn() ? that.zoomFactor : 1)).toFixed(1)
		};
		fillString += (i === 0 ? 'M ' : 'L ') + zoomedCoords.x + ' ' + zoomedCoords.y + ' ';
	};

	// Get the element
	web = this.layers.web.select('path');

	if ( ! revertToOriginal ) {
		// Calculate the new fill string.
		points = this.layers.datapoints.selectAll('circle');
		// sort the points to make sure the path goes around the ring in one direction.
		points[0].sort(function(a, b) {
			return parseFloat(a.getAttribute('data-sortindex'), 10) - parseFloat(b.getAttribute('data-sortindex'), 10);
		});
		points.each(calculateWebPathCoordinate);
	} else {
		// Go back to the original fill string.
		fillString = web.attr('data-secondaryStartingPath') || web.attr('data-originalPath');
	}

	if ( animated ) {
		web
			.transition().ease(easing)
				.duration(this.zoomTime)
				.attr('d', fillString);
	} else {
		web.attr('d', fillString);
	}

	return web;
};


HGraph.prototype.calculateHealthScore = function(){
	//V0.3 of hScore Algorithm.
	if(this.userdata && this.userdata.factors){
		var numPoints = 0;
		var idealValue = Math.abs((this.healthRange.lower + this.healthRange.upper)/2.0)-100;
		var widthGood = this.healthRange.upper - this.healthRange.lower;
		var factor, sumSquares=0;
		for(factor in this.userdata.factors){
			if(!isNaN(factor)) {
				numPoints += this.userdata.factors[factor].weight;
				var score = Math.abs(this.userdata.factors[factor].score)-100;
				sumSquares = sumSquares + (Math.pow(idealValue - score,2) * this.userdata.factors[factor].weight);
			}
		}
		/*console.log('idealValue='+idealValue);
		console.log('numPoints='+numPoints);
		console.log('sumSquares='+sumSquares);
		console.log('score='+parseInt(100-(100/(Math.pow(100,2)*numPoints))*sumSquares));
		*/
		return parseInt(100-(100/(Math.pow(idealValue,2)*numPoints))*sumSquares);
	}
	return 50;
};
