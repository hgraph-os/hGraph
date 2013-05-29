/*
File: HGraphMain.js

Description:
    Combines metrics and user data files in a hGraph friendly format

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

// multiuser example namespace
var mu = mu  || {};

mu.data = function(){
	var metrics;		// metrics object (see metrics.json for format)

	/**
	* Given user data. 
	*
	*/
	var process = function(user) {

		var userMetric = findMetric(user.gender);
		var userDatapoints = user["score_data"];
		var dataPoints = [];

		// retrieves the appropriate metric sets based on gender
		function findMetric(gender){
			for(var i=0; i < metrics.length ; i++) {
				if (metrics[i].gender === gender){
					return metrics[i].metrics;
				}
			}
			return null;
		}

		// finds a datapoint correspondent to a given metric in user dataset 
		function findDatapoint(metric){
			for(var i=0; i<userDatapoints.length; i++) {
				if(userDatapoints[i][metric] !== undefined ) return userDatapoints[i];
			}
			return null;
		}

		
		//Determines score for a non-atomic (with children) metric
		function scoreNoAtomic(metric) {
			var dataPoint = {label   : metric.name,
						score   : 0, value : 0,
						actual: 0, weight: 0,
						details : []};

			// add children (details)
			for(var i=0; i<metric.details.length; i++){
				var currentMetric = metric.details[i];
				var currentDatapoint = findDatapoint(currentMetric.name);

				dataPoint.details.push({
					label : currentMetric.name,
					score : HGraph.prototype.calculateScoreFromValue(currentMetric.features, currentDatapoint.value),
					value: parseFloat(currentDatapoint.value).toFixed(2) +  ' ' +  currentMetric.features.unitlabel,
					actual: currentDatapoint.value,
					weight: currentMetric.features.weight
				})
			}

			// average everything
			// score metric based on subparts
			var directionSum = 0, weightSum = 0, sumSquare = 0;
			for(var i=0; i<dataPoint.details.length; i++) {
				dataPoint.weight += dataPoint.details[i].weight;
				directionSum += dataPoint.details[i].score ;
				weightSum += dataPoint.details[i].weight;
				sumSquare = sumSquare + Math.pow(dataPoint.details[i].weight*dataPoint.details[i].score,2.0);

			}

			var directionMultiplier = 1.0;
			if(directionSum < 0){
				directionMultiplier = -1.0;
			}
			dataPoint.score = directionMultiplier*Math.sqrt(sumSquare)/weightSum;
			dataPoint.weight /= dataPoint.details.length;
			
			return dataPoint;
		};

		
		//Determines score for an atomic (no children) metric
		function scoreAtomic(metric){
			var currentDatapoint = findDatapoint(metric.name);
			return {
				label: metric.name,
				score: HGraph.prototype.calculateScoreFromValue(metric.features, currentDatapoint.value), 
				value: parseFloat(currentDatapoint.value).toFixed(2) +  ' ' +  metric.features.unitlabel,
				weight: metric.features.weight
			};
		};

		// get scores for all metrics
		for(var i=0; i<userMetric.length; i++){
			if (userMetric[i].details) {
				dataPoints.push(scoreNoAtomic(userMetric[i]));
			} else {
				dataPoints.push(scoreAtomic(userMetric[i]));
			}

		}

		return dataPoints;
	},

	/*
	*	initalize data converter
	*/
	initialize = function(metric) {
		metrics = metric;
	};

return{
	initialize : initialize,
	process : process
}

}();