/* ******************************************************* *
 * Main.js - Example useage of the Mixer class             *
 * http://hgraph.org/hMixer                                *
 * Author(s):                                              *
 *  - Danny Hadley <danny@goinvo.com>            		   *
 *  - Matthew Madonna <matthew@myimedia.com>	           *
 * ******************************************************* */
(function () {
    
    var ready,    // the ready function
        metrics,  // the metrics to populate with      (optional)
        options,  // options for how the hMixer works  (optional)
        ajaxconf, // ajax configuration                (optional)
        onloaded; // onloaded callback for ajax method (optional)

	var MetricSpace = MetricSpace || {};

/* example callback for when the ajax method is complete */
onloaded = function ( ) {
    
};

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	
	for (i=0;i<ARRcookies.length;i++)
	  {
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x==c_name)
	    {
	    	return unescape(y);
	    }
	  }
	 return null;
}

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

var cookieEmail = getCookie('email');
var cookieName = getCookie('name');
var cookieMessage = getCookie('message'); 

if (cookieName != null) 
	alertify.success("Welcome Back " + cookieName);

/* example array for metric structures */
/*
metrics = [{"gender":"male",
			"metrics":[{
					"name":"LDL",
					"features":{
						"healthyrange":[22,60],
						"totalrange":[0,160],
						"boundayflags":[false,true],
						"weight":10,
						"unitlabel":"mg/dl"
						}
					},{
						"name":"HDL",
						"features":
							{
								"healthyrange":[100,130],
								"totalrange":[0,130],
								"boundayflags":[false,true],
								"weight":4,
								"unitlabel":"mg/dl"
								}
					},{
						"name":"Triglycerides",
						"features":{
							"healthyrange":[237,400],
							"totalrange":[0,600],
							"boundayflags":[false,true],
							"weight":3,
							"unitlabel":"mg/dl"}
					},{
						"name":"Sleep",
						"features":{
							"healthyrange":[6,9],
							"totalrange":[0,18],
							"boundayflags":[false,true],
							"weight":5,
							"unitlabel":"hours/night"}
					}]
			},{"gender":"female",
			   "metrics":[{
			   	"name":"LDL",
			   	"features":{
			   		"healthyrange":[22,107],
			   		"totalrange":[0,160],
			   		"boundayflags":[false,true],
			   		"weight":5,"unitlabel":"mg/dl"
			   		}
			},{
				"name":"HDL",
				"features":{
					"healthyrange":[56,130],
					"totalrange":[0,130],
					"boundayflags":[false,true],
					"weight":7,"unitlabel":"mg/dl"}
			},{
				"name":"Triglycerides",
				"features":{
					"healthyrange":[237,400],
					"totalrange":[0,600],
					"boundayflags":[false,true],
					"weight":3,
					"unitlabel":"mg/dl"}
			},{
				"name":"Sleep",
				"features":{
					"healthyrange":[6,9],
					"totalrange":[0,18],
					"boundayflags":[false,true],
					"weight":5,
					"unitlabel":"hours/night"}}
		]}];

*/


/* example ajax method setup */



if (cookieEmail != null) {
	ajaxconf = {
	    url      : "http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/metrics.json?email=" + cookieEmail,
	    callback : onloaded
	};
} else  {
	ajaxconf = {
	    url      : "http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/metrics.json",
	    callback : onloaded
	};
}

/* example usage of the "options" parameter */
options = {
    allowTextSelection : false
    // healthy_range         : [0, 400],
    // total_range        : [0, 800]
    // range_fill : "#ff0000" 
    // text_fill  : "#ff0000"
};

ready = function () {
    	Mixer.init(ajaxconf); // initialize the Mixer (ajax version)
};

Entry( ready ); // Use the Entry funciton defined in Utils

function validateEmail(str) { 
	var at="@"
	var dot="."
	var lat=str.indexOf(at)
	var lstr=str.length
	var ldot=str.indexOf(dot)
	if (str.indexOf(at)==-1)
		return false
	if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr)
		return false
	if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr)
		return false
	if (str.indexOf(at,(lat+1))!=-1)
		return false
	if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot)
		return false
	if (str.indexOf(dot,(lat+2))==-1)
		return false
	
	if (str.indexOf(" ")!=-1)
		return false
	
	return true
}

fillData = function(){
	var email = $('#email').val();
	if(validateEmail(email)){
		$.ajax({
			method: 'get',
			beforeSend: function(xhr){  var token = $("meta[name='csrf-token']").attr("content");
				  				xhr.setRequestHeader("X-CSRF-Token", token);},
			url: 'http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/getuser',
			data: {
				'email' : email
			},
			dataType: 'json',
			async: false,
			
			complete: function(jqXHR) {

				console.log('fillData complete, jqXHR readyState is ' + jqXHR.readyState);

				if(jqXHR.readyState === 4) {

				console.log('jqXHR readyState = 4');

	       			if(jqXHR.status == 200){
						var str = jqXHR.responseText;
						console.log('str = ' + str);
						str = str.substring(str.indexOf('<body>')+6, str.indexOf('</body>'));
						console.log('jqXHR str = ' + str);
						var json = $.parseJSON(str);	
						console.log('jqXHR json = ' + json);	
						$('#name').val(json['name']);
						$('#message').val(json['message']);
	       			}
	       		}
	    	}        
			
		});
	}
}

/* submissions on metrics page */
$('#submissions').on('click', (function(event) {

	console.log('submissions on click');

	var cookieEmail = getCookie('email');
	console.log('email = ' + cookieEmail);

	hRenderZone = document.getElementById("metrics")
			|| document.getElementById("context")
			|| document.getElementById("hMixer");

	hRenderZone.innerHTML = ""; 

  // hRenderZone.insertAdjacentHTML('beforeend', '<table><tbody>');
  innerhtml = "<table class=\"table table-bordered\"><tbody>";

	d3.json("http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com:3000/tests/getsubmissions.json", function(error, json) {
		console.log('json = ' + JSON.stringify(json));


      count = json.length;
      i = 0;
		 $.each(json, function (key, value) {

			d3.json("http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com:3000/tests/getuserparams.json?user_id=" + value.user_id, function(error, params) {
				console.log('params = ' + JSON.stringify(params));
				console.log('email = ' + params[0].email);
				full_name = params[0].full_name;
				console.log('full name = ' + full_name);
				pemail = params[0].email;
				div_onclick = function(pemail) {
					console.log('onclick mixer init ' + pemail);
					ajaxconf = {
            					url      : "http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/metrics.json?email=" + pemail,
            					callback : onloaded
        				};
					console.log('ajaxconf = ' + ajaxconf);
					ready = function () {
						console.log('ready');
						Mixer.init(ajaxconf);
					};
					console.log(Entry);
					_isLoaded = false;
					_hasFired = false;
					hPrepped = false;
					Mixer.init(ajaxconf);
					Entry( ready );
				};
        var c = value.created_at.split("T");
        var u = value.updated_at.split("T");
				// hRenderZone.insertAdjacentHTML('beforeend', '<div  data-email="' + params[0].email + '" id="hasemail" onmouseover="this.style.background=&#x27gray&#x27" onmouseout="this.style.background=&#x27#f6f7f6&#x27" class="hasemail' + value.user_id + '" ><tr><font color="#000000"><td>' + full_name + '</td><td>' + value.user_id + '</td><td>' + value.message + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr></font></div>');
				// hRenderZone.insertAdjacentHTML('beforeend', '<tr data-email="' + params[0].email + '" id="hasemail" onmouseover="this.style.background=&#x27gray&#x27" onmouseout="this.style.background=&#x27#f6f7f6&#x27" class="hasemail' + value.user_id + '" ><td>' + full_name + '</td><td>' + value.user_id + '</td><td>' + value.message + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr>');
				innerhtml = innerhtml + '<tr data-email="' + params[0].email + '" id="hasemail" class="hasemail' + value.user_id + '" ><td>' + full_name + '</td><td>' + value.user_id + '</td><td>' + value.message + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr>';
        console.log('innerhtml is ' + innerhtml);
				$('.hasemail' + value.user_id).click( function() { div_onclick($(this).attr('data-email')); });
        //if(i == (count - 2)) {
        //innerhtml = innerhtml + '</tbody></table>'; 
        console.log('done, inner html is ' + innerhtml);
        $('#metrics').html(innerhtml);
        //}
			});

      i++;
      });

    // hRenderZone.insertAdjacentHTML('beforeend', '</tbody></table>');
    // innerhtml = innerhtml + '</tbody></table>';
    // console.log('innerhtml is ' + innerhtml);

    // $('#metrics').append(innerhtml);

		// $('.hasemail').click( function() { div_onclick($(this).attr('data-email')); });

	 });

  // hRenderZone.insertAdjacentHTML('beforeend', '</table>');


}));


/* ajax submit to server */
$('#submit').on('click', function(event){

	console.log('submit on click');

	if (cookieEmail == null) {

		console.log('cookie email is null');

		alertify.set({
			labels : {
				ok : "submit",
				cancel: "cancel"
			},
			buttonFocus: "none"
		});

		alertify.prompt('<div class="container"><form><label>Email:  </label><input type="text" value="" class="email" onchange="fillData();" id="email"><br /><br /><label style="">Name: </label><input type="text" class="name" value="" id="name"><br /><br /><label>Message: </label><input type="text" class="message" value="" id="message"></form></div><br/><br/><p>All of the above fields are required!</p>', function(e){
			if(e){
				eml =  $('#email').val();
				nm =  $('#name').val();
				msg =  $('#message').val();

				console.log('email, name, message = ' + eml + ', ' + nm + ', ' + msg);

				if($('#email').val() != "" && $('#name').val() != "" && $('#message') != "") {

					/* if male and length is 4, append the default female data */

					allCookies = document.cookie;
					console.log('all cookies = ' + allCookies);

					gender = Mixer.getGender();
					console.log('gender = ' + gender);

					metric = Mixer.getMetric();
					console.log('metric = ' + metric);

					for (index = 0; index < metric.length; index++) {

						console.log('metric index = ' + JSON.stringify(metric[index]) + ', ' + index);

					}

					metriclength = metric.length;
					console.log('metric length = ' + metriclength);

					mixer = JSON.stringify(Mixer.getMetric());
					console.log('mixer getMetric = ' + mixer);

					length = mixer.length;
					console.log('length = ' + length);

					if ( (gender == "male") && (metriclength == 4) ) {

						console.log('male and 4, add another copy of metrics');

						/* get female metric from the default user */

						// $('#email').val('drdefacto@defactomd.com');

						// gender = 'female';

						// defactometric = Mixer.getMetric();
						// console.log('defacto metric = ' + defactometric);

						// defactostring = JSON.stringify(defactometric);
						// console.log('defacto string = ' + defactostring);

						console.log('metriclength = 4, attributedata = ' + JSON.stringify(window.attributedata));

						console.log('attributedata 1 metrics = ' + JSON.stringify(window.attributedata.get('1')['metrics'][0]));
						name = window.attributedata.get('1')['metrics'][0]['name'];
						healthyrange = window.attributedata.get('1')['metrics'][0]['features']['healthyrange'];
						totalrange = window.attributedata.get('1')['metrics'][0]['features']['totalrange'];
						weight = window.attributedata.get('1')['metrics'][0]['features']['weight'];
						unitlabel = window.attributedata.get('1')['metrics'][0]['features']['unitlabel'];

						console.log('name, healthyrange, totalrange, weight, unitlabel = ' + name + ', ' + healthyrange + ', ' + totalrange + ', ' + weight + ', ' + unitlabel);
						
						metric0 = '{"name":"' + name + '","dayvalue":false,"healthyrange":[' + healthyrange + '],"totalrange":[' + totalrange + '],"weight":' + weight + ',"unitlabel":"' + unitlabel + '"}';
						
						console.log('metric0 = ' + metric0);
						metric.push(JSON.parse(metric0));
						// metric.push(metric[0]);
						// metric.push(JSON.parse('{"name":"LDL","dayvalue":false,"healthyrange":[63,148],"totalrange":[0,160],"weight":5,"unitlabel":"mg/dl"}'));


                                                name = window.attributedata.get('1')['metrics'][1]['name'];
                                                healthyrange = window.attributedata.get('1')['metrics'][1]['features']['healthyrange'];
                                                totalrange = window.attributedata.get('1')['metrics'][1]['features']['totalrange'];
                                                weight = window.attributedata.get('1')['metrics'][1]['features']['weight'];
                                                unitlabel = window.attributedata.get('1')['metrics'][1]['features']['unitlabel'];

                                                console.log('name, healthyrange, totalrange, weight, unitlabel = ' + name + ', ' + healthyrange + ', ' + totalrange + ', ' + weight + ', ' + unitlabel);

                                                metric1 = '{"name":"' + name + '","dayvalue":false,"healthyrange":[' + healthyrange + '],"totalrange":[' + totalrange + '],"weight":' + weight + ',"unitlabel":"' + unitlabel + '"}';

                                                console.log('metric1 = ' + metric1);
                                                metric.push(JSON.parse(metric1));
						// metric.push(metric[1]);
						// metric.push(JSON.parse('{"name":"HDL","dayvalue":false,"healthyrange":[28,102],"totalrange":[0,130],"weight":7,"unitlabel":"mg/dl"}'));


                                                name = window.attributedata.get('1')['metrics'][2]['name'];
                                                healthyrange = window.attributedata.get('1')['metrics'][2]['features']['healthyrange'];
                                                totalrange = window.attributedata.get('1')['metrics'][2]['features']['totalrange'];
                                                weight = window.attributedata.get('1')['metrics'][2]['features']['weight'];
                                                unitlabel = window.attributedata.get('1')['metrics'][2]['features']['unitlabel'];

                                                console.log('name, healthyrange, totalrange, weight, unitlabel = ' + name + ', ' + healthyrange + ', ' + totalrange + ', ' + weight + ', ' + unitlabel);

                                                metric2 = '{"name":"' + name + '","dayvalue":false,"healthyrange":[' + healthyrange + '],"totalrange":[' + totalrange + '],"weight":' + weight + ',"unitlabel":"' + unitlabel + '"}';

                                                console.log('metric2 = ' + metric2);
                                                metric.push(JSON.parse(metric2));
						// metric.push(metric[2]);
						// metric.push(JSON.parse('{"name":"Triglycerides","dayvalue":false,"healthyrange":[291,454],"totalrange":[0,600],"weight":3,"unitlabel":"mg/dl"}'));


                                                name = window.attributedata.get('1')['metrics'][3]['name'];
                                                healthyrange = window.attributedata.get('1')['metrics'][3]['features']['healthyrange'];
                                                totalrange = window.attributedata.get('1')['metrics'][3]['features']['totalrange'];
                                                weight = window.attributedata.get('1')['metrics'][3]['features']['weight'];
                                                unitlabel = window.attributedata.get('1')['metrics'][3]['features']['unitlabel'];

                                                console.log('name, healthyrange, totalrange, weight, unitlabel = ' + name + ', ' + healthyrange + ', ' + totalrange + ', ' + weight + ', ' + unitlabel);

                                                metric3 = '{"name":"' + name + '","dayvalue":false,"healthyrange":[' + healthyrange + '],"totalrange":[' + totalrange + '],"weight":' + weight + ',"unitlabel":"' + unitlabel + '"}';

                                                console.log('metric3 = ' + metric3);
                                                metric.push(JSON.parse(metric3));
						// metric.push(metric[3]);
						// metric.push(JSON.parse('{"name":"Sleep","dayvalue":false,"healthyrange":[6,9],"totalrange":[0,18],"weight":5,"unitlabel":"hours/night"}'));

						console.log('metric after push = ' + JSON.stringify(metric));

						mixerMetrics = metric;

						/* add the metric from female */
						// mlist = hOriginalData[1].metrics;
						// console.log('mlist = ' + mlist);
						// mixerMetrics = metric + ',' + female metric;


					} else {

						mixerMetrics = metric;

					}

					console.log('mixerMetrics = ' + mixerMetrics);

					setCookie('email', $('#email').val(), 20*365);
					setCookie('name',  $('#name').val(), 20*365);
					setCookie('message', $('#message').val(), 20*365);
					cookieEmail =  $('#email').val();
					cookieName =  $('#name').val();
					cookieMessage =  $('#message').val();

					$.ajax({
							method: 'post',
					         beforeSend: function(xhr){  var token = $("meta[name='csrf-token']").attr("content");
					  xhr.setRequestHeader("X-CSRF-Token", token);},
							url: 'http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/create',
							data: {
								// 'mixer' : JSON.stringify(Mixer.getMetric()),
								'mixer' : JSON.stringify(mixerMetrics),
								'gender' : Mixer.getGender(),
								'email' : $('#email').val(),
								'name' : $('#name').val(),
								'message' : $('#message').val()
							},
							dataType: 'json',
							async: false,
							success: function(data) {
								console.log('success, data is ' + data);
								//$('#alerts').html('success');
							},
							failure: function(xhr, data){
								console.log('fail');
								//$('#alerts').html('failure');
							},
							complete: function(jqXHR) {
								console.log(jqXHR);
					       		if(jqXHR.readyState === 4) {
									alertify.set({
									labels : {ok : "submit"}
									});
					       			if(jqXHR.status == 200)
					          			alertify.success("<h1>Data Submitted Successfully</h1>");
					          		else
					          			alertify.error("<h1>Data Submitted Unsuccessfully</h1>\n\nError: " + jqXHR.statusText);
					       		}
					    	}        
						});	
				}
				else {
					
					$('#submit').click();
					if (eml === "") 
						$('#email').css('border', '1px solid #FF0000');
					if (nm === "")
						$('#name').css('border', '1px solid #FF0000');
					if (msg === "")
						$('#message').css('border', '1px solid #FF0000');
					$('#email').val(eml);
					$('#name').val(nm);
					$('#message').val(msg);
					alertify.error("<h1>All fields are required</h1>");
				}
			}
		});
		$('#alertify').css('top', '50%');
		$('#alertify').css('margin-top', '-' + $('#alertify').height()/1.1 + 'px');
		console.log($('#alertify').css('margin-top'));
	} else {

		console.log('cookieEmail is not null');

		$.ajax({
			method: 'post',
	         	beforeSend: function(xhr){
				var token = $("meta[name='csrf-token']").attr("content");
				xhr.setRequestHeader("X-CSRF-Token", token);
			},
			url: 'http://ec2-184-169-229-248.us-west-1.compute.amazonaws.com/tests/create',
			data: {
				'mixer' : JSON.stringify(Mixer.getMetric()),
				'gender' : Mixer.getGender(),
				'email' : cookieEmail,
				'name' : cookieName,
				'message' : cookieMessage
			},
			dataType: 'json',
			async: false,
			success: function(data) {
				console.log('success, data is ' + data);
				//$('#alerts').html('success');
			},
			failure: function(xhr, data){
				console.log('fail');
				//$('#alerts').html('failure');
			},
			complete: function(jqXHR) {

				console.log('jqXHR = ' + jqXHR);

				if(jqXHR.readyState === 4) {

					alertify.set({
						labels : {ok : "submit"}
					});

	       				if(jqXHR.status == 200)
	          				alertify.success("<h1>Data Submitted Successfully</h1>");
	          			else
	          				alertify.error("<h1>Data Submitted Unsuccessfully</h1>\n\nError: " + jqXHR.statusText);
	       			}
	    		}        
		});	
	}
		
});

})();
