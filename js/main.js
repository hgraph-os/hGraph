/*
 * These values will eventually be placed
 * onto the page during its creation,
 * or loaded from a back-end database through
 * an XHR call. 
*/
function rando(){
	var h = (Math.random() * 100),
		b = h % 90,
		f = parseInt(b + 10);
		
	return f;
}

var example_factors = Array(
{
	label : 'Weight',
	score : rando(),
},{
	label : 'Happiness',
	score : rando(),
},{
	label : 'Sleep',
	score : rando(),
},{
	label : 'Family History',
	score : rando(),

},{
	label : 'Personal History',
	score : rando(),
},{
	label : 'Medications',
	score : rando(),
},{
	label : 'Triglycerides',
	score : rando(),
},{
	label : 'LDL',
	score : rando(),
},{
	label : 'HDL',
	score : rando(),
},{
	label : 'Glucose',
	score : rando(),
},{
	label : 'BP',
	score : rando(),
},{
	label : 'Environment',
	score : rando(),
},{
	label : 'Alcohol, Drugs',
	score : rando(),
},{
	label : 'Vaccinations',
	score : rando(),
},{
	label : 'Exercise',
	score : rando(),
},{
	label : 'Calorie Intake',
	score : rando(),
},{
	label : 'Waist Circumference',
	score : rando(),
});

var hg
window.onload = function(){
	hg = new HGraph({
		container   : document.getElementById("viz"),
		hoverevents : true,
		userdata    : {
			overallScore : rando().toFixed(0),
			factors      : example_factors,	
		},
	});
	hg.initialize();

	$("#zoom_btn").click(function(){
		var s = hg.isZoomed;
		if(!s){
			$(this).find("span").addClass("zoomed");
			hg.zoomIn();
		}else{
			$(this).find("span").removeClass("zoomed");
			hg.zoomOut();
		}
	});
	
	$("#connector_btn").click(function(){
		var t = hg.toggleConnections();
		if(!t){
			$(this).find("span").addClass("toggled");
		} else {
			$(this).find("span").removeClass("toggled");
		}
	});
	

}







