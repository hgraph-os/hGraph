(function () {
var gender = 'male'
$(document).ready(function (){
	$.ajax({
		method: 'get',
		beforeSend: function(xhr){  var token = $("meta[name='csrf-token']").attr("content");
			  				xhr.setRequestHeader("X-CSRF-Token", token);},
		url: 'data/metrics.json',
		dataType: 'json',
		async: true,
		complete: function(jqXHR) {
			console.log('fillData complete, jqXHR readyState is ' + jqXHR.readyState);

			if(jqXHR.readyState === 4) {

			console.log('jqXHR readyState = 4');

       			if(jqXHR.status == 200){
					var randomBetween = function (min, max) {
					    if (min < 0) {
					        return min + Math.random() * (Math.abs(min)+max);
					    }else {
					        return min + Math.random() * max;
					    }
					};
					var str = jqXHR.responseText;
					console.log('str = ' + str);
					var json = $.parseJSON(str);
					var factors_array = [];
					var factor_json;
					var cholesterol = {
						label   : 'Total Cholesterol',
						score   : 0,
						value : 0,
						actual: 0,
						weight: 0,
						details : []
					}
					var bp = {
						label   : 'Blood Pressure',
						score   : 0,
						value : 0,
						actual: 0,
						weight: 0,
						details : []
					}					
					if (json[0].gender === gender)
						factor_json = json[0].metrics;
					else
						factor_json = json[1].metrics;
					
					console.log(factor_json);
					for (var i = 0; i < factor_json.length; i++) {
						var random = randomBetween(factor_json[i].features.totalrange[0], factor_json[i].features.totalrange[1]);
						console.log(factor_json[i].name);
						console.log(factor_json[i].features);
						console.log(random);
						if ((factor_json[i].name === 'LDL' || factor_json[i].name === 'HDL' || factor_json[i].name === 'Triglycerides') && cholesterol != null)
						{
							cholesterol.details.push({
								label: factor_json[i].name,
								score: HGraph.prototype.calculateScoreFromValue(factor_json[i].features, random), 
								value: parseFloat(random).toFixed(2) +  ' ' +  factor_json[i].features.unitlabel,
								actual: random,
								weight: factor_json[i].features.weight
							});
							if (cholesterol.details.length >= 3) {
								for(var j = 0; j < cholesterol.details.length; j++) {
									cholesterol.score = cholesterol.score + cholesterol.details[j].score
									cholesterol.actual = cholesterol.actual + cholesterol.details[j].actual
									cholesterol.weight = cholesterol.weight + cholesterol.details[j].weight
								}
								cholesterol.score /= 3;
								cholesterol.weight /= 3;
								cholesterol.value = parseFloat(cholesterol.actual).toFixed(2)  +  ' ' + factor_json[i].features.unitlabel;
								factors_array.push(cholesterol);
								cholesterol = null
							}
							
							
						} else if ((factor_json[i].name === 'Blood Pressure Diastolic' || factor_json[i].name === 'Blood Pressure Systolic') && bp != null)
						{
							bp.details.push({
								label: factor_json[i].name.replace('Blood Pressure ', ''),
								score: HGraph.prototype.calculateScoreFromValue(factor_json[i].features, random), 
								value: parseFloat(random).toFixed(2) +  ' ' +  factor_json[i].features.unitlabel,
								weight: factor_json[i].features.weight,
								actual: random
							});
							if (bp.details.length >= 2) {
								console.log(bp.score);
								for(var j = 0; j < bp.details.length; j++) {
									bp.score = bp.score + bp.details[j].score;
									bp.weight = bp.weight + bp.details[j].weight;
								}
								bp.score /= 2;
								bp.weight /= 2;
								bp.value = parseFloat(bp.details[0].actual).toFixed(2)  +  '/' + parseFloat(bp.details[1].actual).toFixed(2) + ' ' + factor_json[i].features.unitlabel;
								factors_array.push(bp);
								bp = null
							}
							
							
						}
						else 
							factors_array.push(
							{
								label: factor_json[i].name,
								score: HGraph.prototype.calculateScoreFromValue(factor_json[i].features, random), 
								value: parseFloat(random).toFixed(2) +  ' ' +  factor_json[i].features.unitlabel,
								weight: factor_json[i].features.weight
							}
						)
					}
					var opts = {
						container: document.getElementById("viz"),
						userdata: {
							hoverevents : true,
				            factors: factors_array
						},
						showLabels : true
					};
					console.log(opts);
					graph = new HGraph(opts);
					graph.width = 760;
					graph.height = 602;
					graph.initialize();
					$('#zoom').on('click', function(){
						console.log(graph.isZoomed)
						if (graph.isZoomed)
							graph.zoomOut();
						else
							graph.zoomIn();
					});
					
					$("#zoom_btn").click(function(){
						var s = graph.isZoomed;
						if(!s){
							$(this).find("span").addClass("zoomed");
							graph.zoomIn();
						}else{
							$(this).find("span").removeClass("zoomed");
							graph.zoomOut();
						}
					});
					
					$("#connector_btn").click(function(){
						var t = graph.toggleConnections();
						if(!t){
							$(this).find("span").addClass("toggled");
						} else {
							$(this).find("span").removeClass("toggled");
						}
					});
						
					function focusFeature( f, e ){
						
						for(var key  in graph.layers){
							var p = graph.layers[key];
							if( e == key ){ 
								p.transition()	
									.duration(120)
									.ease("cubic")
									.attr("opacity",1.0);
									continue;
							}
							p.transition()	
								.duration(120)
								.ease("cubic")
								.attr("opacity",0.1);
						}
						if(f == "points"){
							for(var i in graph[f]){
								graph[f][i]
									.transition()
									.duration(1200)
									.ease("elastic")
									.attr("r",graph.getPointRadius()*1.5);
							}
						} else {
							graph[f].transition()
								.duration(1200)
								.ease("elastic")
								.attr("transform","scale(1.5)");
						}
					};
					
					function returnToNormal( f ){
						if(f == "points"){
							for(var i in graph[f]){
								graph[f][i]
									.transition()
									.duration(1200)
									.ease("elastic")
									.attr("r",graph.getPointRadius());
							}
						} else {
							graph[f].transition()
								.duration(1200)
								.ease("elastic")
								.attr("transform","scale(1.0)");
						}
					};
					
					function returnall(){
						for(var key  in graph.layers){
							var p = graph.layers[key];
							p.transition()	
								.duration(120)
								.ease("cubic")
								.attr("opacity",1.0);
						}
					};
					
					function atEnd( which ){
						var btn = (which > 0) ? "#next_info" : "#prev_info";
						$(".novis").removeClass("novis");
						$(btn).addClass("novis");
					};
				
					function inMiddle(){
						$(".novis").removeClass("novis");
					};
				
					/* set the size of the info slider */
					var t = 0, c = 0, l = 0, iil = $("#info_panel .info_item");
					$("#info_panel .info_item").each(function(){ t += (this.offsetWidth +160); l++; });
					$("#info_slider").css("width",(t+"px"));
					/* info slider controll button clicks */
					$(".control_btn").click(function(){
						var i  = parseInt( this.dataset.inc ),
							nc = c + i,
							fc = c + (i * 2);
						if(nc < 0 || nc > (l-1)){ return };
						if(fc < 0 || fc > (l-1)){ atEnd(fc); }
						else{ inMiddle(); }
						
						var p = iil[c].dataset.feature;
						if( p ){ returnToNormal( p ); }
						
						d3.timer.flush();
						
						c += i;
						var d = c * (-760);
						$("#info_slider").stop().animate({
							"left":(d+"px")
						},300);
						
						var f = iil[c].dataset.feature,
							e = iil[c].dataset.exclude;
						if( d ){ focusFeature( f, e ); }
						else{ returnall(); }		
					});
					
					$('.graph_nav_opt').on("mousedown",function(){
						$(this).removeClass("grad1").addClass("grad2");
					}).on("mouseup",function(){
						$(this).removeClass("grad2").addClass("grad1");
					});
					//*//
				
					function closeInfo(){
						returnall();
						returnToNormal("points");
						returnToNormal("overalltxt");
						returnToNormal("ring");	
						c = 0;
						var d = c * (-760);
						$("#info_slider").stop().animate({
							"left":(d+"px")
						},300);
						atEnd(c);
					};
				
					$("#info_btn").click(function(){
						var r = $(this).hasClass("risen");
						if(!r){
							$("#info_panel").stop().animate({
								"bottom" : "0px"
							},300);
							$(this).addClass("risen");
						} else {
							$("#info_panel").stop().animate({
								"bottom" : "-300px"
							},300);
							closeInfo();
							$(this).removeClass("risen");
						}
						
					});
				}
       		}
    	}

	});
});
})();