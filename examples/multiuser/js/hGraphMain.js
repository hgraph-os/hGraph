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

	var accessToken ="745b2a6d68e24e1a93a92cf26643b07b";
	var baseUrl = "https://api.dialogflow.com/v1/";
	$(document).ready(function() {
			$("#input").keypress(function(event) {
					if (event.which == 13) {
							event.preventDefault();
							send();
this.value = '';
					}
			});
			$("#rec").click(function(event) {
					switchRecognition();
			});
	});
	var recognition;
	function startRecognition() {
			recognition = new webkitSpeechRecognition();
			recognition.onstart = function(event) {
					updateRec();
			};
			recognition.onresult = function(event) {
					var text = "";
					for (var i = event.resultIndex; i < event.results.length; ++i) {
							text += event.results[i][0].transcript;
					}
					setInput(text);
					stopRecognition();
			};
			recognition.onend = function() {
					stopRecognition();
			};
			recognition.lang = "en-US";
			recognition.start();
	}
	function stopRecognition() {
			if (recognition) {
					recognition.stop();
					recognition = null;
			}
			updateRec();
	}
	function switchRecognition() {
			if (recognition) {
					stopRecognition();
			} else {
					startRecognition();
			}
	}
	function setInput(text) {
			$("#input").val(text);
			send();
	}
	function updateRec() {
      $("#rec").backgroundColor(recognition ? colorchange() : changecolor() );
    }
    function colorchange() {
      document.getElementById("rec").style.backgroundColor = "#fc6f6f";

    }
    function changecolor() {
      document.getElementById("rec").style.backgroundColor = "#82b780";
    }
function send() {
			var text = $("#input").val();
	conversation.push("\nUser: " + text + '\r\n\n');
			$.ajax({
					type: "POST",
					url: baseUrl + "query?v=20150910",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					headers: {
							"Authorization": "Bearer " + accessToken
					},
					data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
					success: function(data) {
							var respText = data.result.fulfillment.speech;
							console.log("Respuesta: " + respText);
							var shr = data.result.parameters
							for (x in data.result.parameters){
								if (data.result.parameters[x].length != 0){
									if (x==='height' || x === 'weight' ||x === 'age' ){
										if(x == "height"){
									var hvalue = data.result.parameters[x].amount;
									var hunit = data.result.parameters[x].unit;
									}
									if(x == "weight"){
									var wvalue = data.result.parameters[x].amount;
									var wunit = data.result.parameters[x].unit;
									}
										conversation.push(x + ": " + data.result.parameters[x].amount + '\r\n')
										conversation.push(x + ": " + data.result.parameters[x].unit + '\r\n')
									} else {
									if (x == "waist"){
										var waist =data.result.parameters[x];
										}
										if(x == "drinks"){
										var alcohol = data.result.parameters[x];
										}
										if (x == "sleep"){
										var sleep = data.result.parameters[x];
										}
										if (x == "exercise"){
										var exercise = data.result.parameters[x];
										}
										if (x == "cigarettes"){
										var smoking= data.result.parameters[x];
										}
										if (x == "happiness"){
										var happiness = data.result.parameters[x];
										}
										if (x == "glucose"){
										var glucose = data.result.parameters[x];
										}
										if (x == "LDL"){
										var LDL = data.result.parameters[x];
										}
										if (x == "HDL"){
										var HDL = data.result.parameters[x];
										}
										if (x == "diastolic"){
										var diastolic = data.result.parameters[x];
										}
										if (x == "systolic"){
										var systolic = data.result.parameters[x];
										}
										if (x == "pain"){
										var pain = data.result.parameters[x];
										}
									conversation.push(x + ": " + data.result.parameters[x]+ '\r\n')
									}
								}

			}



 var obj = {
"name" : "Sonin Juhan",
"gender" : "male",
"score_data" : [
{
		"Weight"       : 14,
		"value"     : wvalue || 204
 },
 {
		"LDL"       : 1,
		"value"     : LDL || 251
 },
 {
		"HDL"       : 2,
		"value"     : HDL || 35
 },
 {
		"Triglycerides" : 3,
		"value"         : 140
 },
 {
		"Sleep"     : 4,
		"value"     : sleep || 5
 },
 {
		"Exercise"  : 5,
		"value"     : exercise || 3
 },
 {
		"Happiness" : 6,
		"value"     : happiness || 9
 },
 {
		"Glucose"   : 7,
		"value"     : glucose || 101
 },
 {
		"Blood Pressure Systolic" : 8,
		"value"     : systolic || 117
 },
 {
		"Blood Pressure Diastolic" : 9,
		"value"     : diastolic || 79
 },
 {
		"Alcohol"   : 10,
		"value"     : alcohol || 0
 },
 {
		"Smoking"   : 11,
		"value"     : smoking || 0
 },
 {
		"Waist Circumference" : 12,
		"value"     : waist || 34
 },
 {
		"Pain"      : 13,
		"value"     : pain || 1
 }
]
};

								if(data.result.actionIncomplete == false){


									 var dataPoints = mu.datas.process(obj);

									// renders hGraph
									renderHgraph(dataPoints);
								}
						 setResponse(respText);
							$("#response").scrollTop($("#response").height());
					},
					error: function() {
							setResponse("Internal Server Error");
					}
			});
	}
	function setResponse(val) {
		//Edit "AI: " to change name
			conversation.push("\nDialogFlow: " + val + '\r\n');
			$("#response").text(conversation.join(""));
	}
	var conversation = [];


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
		mu.datas.initialize(metrics);
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
