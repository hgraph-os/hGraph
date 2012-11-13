/*global d3: true */
/*
File: HGraph.js

Description:
	Class for generating the Health Score Graphs

Requires:
	d3.js

Authors:
	Michael Bester <michael@kimili.com>
	Danny Hadley <danny@goinvo.com>
	
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
	this.zoomFactor       = opts.zoomFactor || 2.2;
	this.zoomTime         = opts.zoomTime || 800;	
	
	this.healthRange      = {
		lower : 30,
		upper : 80
	};
	this.halfWidth        = 0;
	this.halfHeight       = 0;

	this.userdata         = opts.userdata || {};
	this.primaryIncrement = 1;

	this.showLabels   = false;
	this.isZoomed     = false;
	this.hoverevents  = opts.hoverevents || false;
	this.isConnected  = true; 
	this.dragging     = false;

	this.center       = null;
	this.originCoords = {
		x : 0,
		y : 0
	};
	this.layers       = {
		ring       : null,
		web        : null,
		text       : null,
		datapoints : null,
		connectors : null,
	};
	
	this.points = Array();

	this.colors      = {
		ring       : '#bdcc9e',
		text       : '#444648',
		outOfRange : '#e1604f',
		inRange    : '#616363',
		web        : 'rgba(0,0,0,0.1)'
	};
};

/**
 *  Function: HGraph.initialize
 *     Sets up and draws the graph
 */
HGraph.prototype.initialize = function() {
	
	this.container.onselectstart = function(e){ if(e.preventDefualt){ e.preventDefault();} return false; }

	var layer, i, datapoint, web, touchstart, movedelta, that;

	that = this;

	this.width      = this.width || this.container.offsetWidth;
	this.height     = this.height || this.container.offsetHeight;
	this.halfWidth  = this.width / 2;
	this.halfHeight = this.height / 2;

	this.showLabels = ((this.width / this.height) > 1.2);

	this.scaleRange = this.showLabels ?
						[this.halfHeight / 4, this.halfHeight / 1.25] :
						[this.halfHeight / 3, this.halfHeight];

	this.center      = 'translate(' + this.halfWidth + ',' + this.halfHeight + ')';
	this.topleft     = 'translate(0,0)';

	this.scale       = d3.scale.linear().domain([0,100]).range(this.scaleRange);
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
			                         .attr('transform', this.center)
			                         .attr("opacity",1.0);
		}
	}

	this.originCoords.x = this.halfWidth;
	this.originCoords.y = this.halfHeight;

	// Draw the ring around the user's health score
	this.ringpath = d3.svg.arc()
                 .startAngle(0)
                 .endAngle(360)
                 .innerRadius(this.scale(this.healthRange.lower))
                 .outerRadius(this.scale(this.healthRange.upper));

	this.ring = this.layers.ring.append('path').attr('d', this.ringpath).attr('fill', this.colors.ring);

	// and the score itself
	this.overalltxt = this.layers.text.append('text')
	                      .attr('class','overall')
	                      .text(this.calculateHealthScore());

	// Center the score
	this.overalltxt
		.attr('x', 0 - (this.overalltxt[0][0].offsetWidth / 2))
		.attr('y', this.overalltxt[0][0].offsetHeight / 3);


	// Figure out how many points there should be
	this.primaryIncrement = 360 / this.userdata.factors.length || 1;

	// Add the datapoints.
	for (i = 0; i < this.userdata.factors.length; i++) {
		datapoint = this.userdata.factors[i];
		this.points.push( this.addPoint(datapoint, i) );
	}

	// Create a web path and hook it up
	web = this.layers.web.append('path');
	this.updateWeb(false);
	web
		.attr('data-originalPath', web.attr('d'))
		.attr('fill', this.colors.web);

	// Set up the dragability of the zoomed in graph
	touchstart = {
		x : 0,
		y : 0
	};
	moveDelta = {
		x : 0,
		y : 0
	};
	this.container.addEventListener('touchstart', function(e){
		var touch;

		if ( e.touches.length > 1) {
			return;
		}

		touch = e.touches[0];
		touchstart.x = touch.pageX;
		touchstart.y = touch.pageY;
	});
	this.container.addEventListener('touchmove', function(e){
		var key, layer, delta, touch;

		e.preventDefault();

		if ( ! that.isZoomedIn() ) {
			return;
		}

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
	this.container.addEventListener('touchend', function(e){
		if ( e.touches.length > 1) {
			return;
		}
		that.originCoords.x = moveDelta.x;
		that.originCoords.y = moveDelta.y;
	});
	
	this.container.addEventListener('mousedown',function(e){
		that.dragging = true;
		touch = e;
		touchstart.x = touch.offsetX;
		touchstart.y = touch.offsetY;
	});
	this.container.addEventListener('mousemove',function(e){
		if(!that.dragging){ return; }
		
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
	this.container.addEventListener('mouseup',function(e){
		that.dragging = false;
		that.originCoords.x = moveDelta.x;
		that.originCoords.y = moveDelta.y;
	});
};

/**
 *  Function: HGraph.zoomIn
 *     Zooms the graph.
 *
 *  Arguments:
 *      zoomFactor - *(Number)* The factor you want to zoom in by. If omitted, the instance's default zoom factor is used.
 */
HGraph.prototype.zoomIn = function(zoomFactor) {
	var key, i, j, factor, details, layer, labels, that, zoomedWebFillString, getZoomedRingPath, getZoomedX, getZoomedY, scoreRange, connections;

	that = this;
	zoomFactor = zoomFactor || this.zoomFactor; // Allow zooming factor override.
	zoomedWebFillString = '';

	getZoomedRingPath = function() {
		var zoomedRingPath, zoomedScale, zoomedScaleRange, i;

		zoomedScaleRange = [];
		for (i = 0; i < that.scaleRange.length; i++) {
			zoomedScaleRange.push(that.scaleRange[i] * zoomFactor);
		}
		zoomedScale = d3.scale.linear().domain([0,100]).range(zoomedScaleRange);
		zoomedRingPath = d3.svg.arc()
		                     .startAngle(0)
		                     .endAngle(360)
		                     .innerRadius(zoomedScale(that.healthRange.lower))
		                     .outerRadius(zoomedScale(that.healthRange.upper));

		return zoomedRingPath;
	};

	getZoomedX = function() {
		var coords = JSON.parse(this.getAttribute('data-origCoords'));
		return coords.x * zoomFactor;
	};

	getZoomedY = function() {
		var coords = JSON.parse(this.getAttribute('data-origCoords'));
		return coords.y * zoomFactor;
	};
	
	getZoomedX1 = function(){
		var coords = JSON.parse(this.getAttribute('data-origPCoords'));
		return coords.x * zoomFactor;
	};
	getZoomedX2 = function(){
		var coords = JSON.parse(this.getAttribute('data-origLCoords'));
		return coords.x * zoomFactor;
	};
	getZoomedY1 = function(){
		var coords = JSON.parse(this.getAttribute('data-origPCoords'));
		return coords.y * zoomFactor;
	};
	getZoomedY2 = function(){
		var coords = JSON.parse(this.getAttribute('data-origLCoords'));
		return coords.y * zoomFactor;
	};
	
	setDetailText = function() {
		return this.textContent + ' (' + this.getAttribute('data-metricValue') + ')';
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
			} else if ( key === 'connectors') {
				connections = layer.selectAll("line");
				connections
					 .transition().ease('elastic')
							.duration(this.zoomTime)
							.attr('x1', getZoomedX1)
							.attr('y1', getZoomedY1)
							.attr('x2', getZoomedX2)
							.attr('y2', getZoomedY2);
			}

			// Move it to the new origin point.
			layer
				.transition().ease('quad-out')
					.duration(this.zoomTime * 0.8)
					.attr('transform', this.topleft);
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

	this.originCoords.x = 0;
	this.originCoords.y = 0;

	this.isZoomed = true;
	
};

/**
 *  Function: HGraph.zoomOut
 *     Zooms the graph back to its original dimensions
 */
HGraph.prototype.zoomOut = function() {
	var getOriginalX, getOriginalY, setDetailText, web;

	getOriginalX = function() {
		var coords = JSON.parse(this.getAttribute('data-origCoords'));
		return coords.x;
	};

	getOriginalY = function() {
		var coords = JSON.parse(this.getAttribute('data-origCoords'));
		return coords.y;
	};
	
	getOriginalX1 = function(){
		var coords = JSON.parse(this.getAttribute('data-origPCoords'));
		return coords.x;
	};
	getOriginalX2 = function(){
		var coords = JSON.parse(this.getAttribute('data-origLCoords'));
		return coords.x;
	};
	getOriginalY1 = function(){
		var coords = JSON.parse(this.getAttribute('data-origPCoords'));
		return coords.y;
	};
	getOriginalY2 = function(){
		var coords = JSON.parse(this.getAttribute('data-origLCoords'));
		return coords.y;
	};
	

	setDetailText = function(d) {
		return this.textContent.replace(/\s+\([^\)]*\)$/, '');
	};

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
				} else if ( key === 'connectors') {
					connections = layer.selectAll("line");
					connections
						.transition().ease('elastic')
							.duration(that.zoomTime)
							.attr('x1', getOriginalX1)
							.attr('y1', getOriginalY1)
							.attr('x2', getOriginalX2)
							.attr('y2', getOriginalY2);
				}

				// Move the layer back to the center
				that.layers[key]
					.transition().ease('quad-in')
						.duration(that.zoomTime)
						.attr('transform', that.center);
			}
		}
		that.isZoomed = false;

	}, this.zoomTime * 0.9, this);


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
HGraph.prototype.getPointRadius = function() {
	return Math.max(1, Math.min(10, Math.round(this.width / 80)));	
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

	index = typeof index === 'number' ? index : 1;
	secondary = (startingScoreRange && startingScoreRange.constructor === Array);

	// Private utility functions to get the point color
	getPointColor = function(score) {
		return (score > this.scale(this.healthRange.lower) && score < this.scale(this.healthRange.upper) ) ? this.colors.inRange : this.colors.outOfRange;
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

	radius = this.getPointRadius();
	point = this.layers.datapoints.append('circle')
			.data([datapoint.score])
			.attr('r', secondary ? radius / 1.5 : radius)
			.attr('cx', (startingCoords ? startingCoords.x : coords.x) * (this.isZoomedIn() ? this.zoomFactor : 1))
			.attr('cy', (startingCoords ? startingCoords.y : coords.y) * (this.isZoomedIn() ? this.zoomFactor : 1))
			.attr('data-origCoords', JSON.stringify(coords))
			.attr('data-sortIndex', typeof sortIndex === 'number' ? sortIndex + '.' + index : index)
			.attr('fill', getPointColor.call(this, scaledDataValue));

	if ( startingCoords ) {
		point.attr('data-startingCoords', JSON.stringify(startingCoords));
	}

	// Note the secondary class as such
	if ( secondary ) {
		point.classed('secondary', true);
	}

	
	if ( this.showLabels ) {
		// Calculate the size of the datapoint radius (clamping it between 1 and 10)
		labelPointScale = Math.max(scaledDataValue + (radius * 3), this.scale(100));

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

		metricValue = datapoint.value || datapoint.score;

		label = this.layers.datapoints.append('text')
				.text(datapoint.label + (labelWithDetail ? ' (' + metricValue + ')' : ''))
				.data([datapoint.score])
				.attr('class', 'label')
				.attr('x', labelCoords.x)
				.attr('y', labelCoords.y)
				.attr('data-origCoords', JSON.stringify(labelCoords))
				.attr('data-metricValue', metricValue)
				.attr('fill', getPointColor.call(this, scaledDataValue))
				.attr('text-anchor', getTextAnchor(coords.x));

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
	
		//add connectors to show points and labels more clearly
		var dx = labelCoords.x - coords.x,
			dy = labelCoords.y - coords.y;
			
		var p2ld = Math.sqrt( (dx*dx) + (dy*dy) );
		if( p2ld > 120 && !this.isZoomedIn() ){
			var pc = {
				x : coords.x * 1.15,
				y : coords.y * 1.15,
			}, lc = {
				x :  labelCoords.x * 0.92,
				y :  labelCoords.y * 0.92,
			};
			this.layers.connectors.append("line")
				.attr("x1", pc.x)
				.attr("y1", pc.y)
				.attr("x2", lc.x)
				.attr("y2", lc.y)
				.attr('data-origPCoords', JSON.stringify(pc))
				.attr('data-origLCoords', JSON.stringify(lc))
				.attr("class","connector")
				.attr("stroke",this.colors.outOfRange)
				.attr("stroke-width",1.0)
				.attr("opacity",1.0);
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
		pointCoords = JSON.parse(this.getAttribute('data-startingCoords') || this.getAttribute('data-origCoords'));
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
			return parseFloat(a.getAttribute('data-sortIndex'), 10) - parseFloat(b.getAttribute('data-sortIndex'), 10);
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


HGraph.prototype.toggleConnections = function(){
	var o = (arguments[0] === 1 || arguments[0] === 0) ? arguments[0] : ((this.isConnected) ? 0.0 : 1.0);
	this.layers.connectors
		.transition()
		.ease('quad-in-out')
		.duration(300)
		.attr("opacity",o);
	
	if(typeof arguments[0] != "number"){
		this.isConnected = (this.isConnected) ? false : true;
	}
	return this.isConnected;
};
HGraph.prototype.calculateHealthScore = function(){
	//V0.2 of hScore Algorithm.
	if(this.userdata && this.userdata.factors){
		var numPoints = this.userdata.factors.length;
		var idealValue = (this.healthRange.lower + this.healthRange.upper)/2.0;
		var widthGood = this.healthRange.upper - this.healthRange.lower;
		var alpha = 25* widthGood*widthGood/(numPoints * idealValue * idealValue);
		var factor, sumSquares=0;
		for(factor in this.userdata.factors){
			var score = this.userdata.factors[factor].score;
			console.log(score);
			sumSquares = sumSquares + Math.pow(idealValue - score,2);
		}
		console.log("sumSquares="+sumSquares);
		return parseInt(100-(4*alpha/(widthGood*widthGood))*sumSquares);
	}
	return 50;
};