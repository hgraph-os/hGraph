/*
 * These values will eventually be placed
 * onto the page during its creation,
 * or loaded from a back-end database through
 * an XHR call. 
*/
function rando(){
	return ((Math.random() * 100) % 90) + 10;
}
var example_factors = Array(
{
	label : 'Family History',
	score : rando(),
},{
	label : 'Caloric Intake',
	score : rando(),
},{
	label : 'Blood Pressure',
	score : rando(),

},{
	label : 'Stress',
	score : rando(),
},{
	label : 'Sleep',
	score : rando(),
},{
	label : 'Happiness',
	score : rando(),
},{
	label : 'Exercise',
	score : rando(),
},{
	label : 'Weight',
	score : rando(),
},{
	label : 'Total Cholesterol',
	score : rando(),
});

var hg
window.onload = function(){
	hg = new HGraph({
		container : document.getElementById("viz"),
		userdata  : {
			overallScore : 80,
			factors      : example_factors,	
		},
	});
	hg.initialize();

}