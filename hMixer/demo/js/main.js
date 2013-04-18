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

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});
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
var joy;
$(window).ready(joy = $('#joyRideTipContent').joyride({
	autoStart : false,
	postExposeCallback : function (index, tip) {
		if (index == 3) {
			$('.joyride-expose-wrapper').hide();
		}
	},
	modal:true,
	expose: true
}));
var joyride = $.getUrlVar('joyride')
if($.getUrlVar('email') == null && cookieEmail == null){
	alertify.prompt("<div id='domMessage' class='darkClass'><h1>Please login with your Doximity Account</h1><br/><a class='doxButton'><img src='img/doximity-button-verify-dark.png'></img></a><br/><br/><br/><a class='skipButton'>Skip this step</a></div>" );
	$('#alertify').css('top', '50%');
	$('#alertify').css('margin-top', '-' + $('#alertify').height()/1.1 + 'px');
	$('#alertify-cover').css('background-color', 'grey');
	$('#alertify-cover').css('opacity', '0.5');
	$('.alertify-buttons').hide();
	
	$('.doxButton').on('click', function(){
		if(joyride)
			joy.joyride()
		$('#alertify-ok').click();
	});
	$('.skipButton').on('click', function(){
		if(joyride)
			joy.joyride()		
		$('#alertify-ok').click();
	});

}

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



if($.getUrlVar('email') != null){
	console.log($.getUrlVar('readonly'))
	ajaxconf = {
	    url      : "/tests/metrics.json?email=" + $.getUrlVar('email'),
	    callback : onloaded
	};
	options = {
    	allowTextSelection : false,
	    read_only: (/^true$/i).test($.getUrlVar('readonly'))
	}
} else if  (cookieEmail != null)  {
	ajaxconf = {
	    url      : "/tests/metrics.json?email=" + cookieEmail,
	    callback : onloaded
	};
	options = {
	    allowTextSelection : false
	    // healthy_range         : [0, 400],
	    // total_range        : [0, 800]
	    // range_fill : "#ff0000"
	    // text_fill  : "#ff0000"
	};
} else {
	ajaxconf = {
	    url      : "/tests/metrics.json",
	    callback : onloaded
	};
	options = {
	    allowTextSelection : false
	    // healthy_range         : [0, 400],
	    // total_range        : [0, 800]
	    // range_fill : "#ff0000"
	    // text_fill  : "#ff0000"
	};
}

ready = function () {
    	Mixer.init(ajaxconf, options); // initialize the Mixer (ajax version)
};

Entry( ready ); // Use the Entry funciton defined in Utils

$.ajax({
	method: 'get',
	beforeSend: function(xhr){  var token = $("meta[name='csrf-token']").attr("content");
		  				xhr.setRequestHeader("X-CSRF-Token", token);},
	url: '/tests/metrics.json',
	dataType: 'json',
	async: true,
	complete: function(jqXHR) {
		console.log('fillData complete, jqXHR readyState is ' + jqXHR.readyState);

		if(jqXHR.readyState === 4) {

		console.log('jqXHR readyState = 4');

   			if(jqXHR.status == 200){
   				
				var str = jqXHR.responseText;
				var json = $.parseJSON(str);
				var factors_array = [];
				var factor_json;
				if (json[0].gender === 'male')
					factor_json = json[0].metrics;
				else
					factor_json = json[1].metrics;
				for (var i = 0; i < factor_json.length; i++) {
					var random = 0;
						factors_array.push(
						{
							label: factor_json[i].name,
							score: 0, 
							value: 0 +  ' ' +  factor_json[i].features.unitlabel,
							weight: 1
						}
					)
				}
				var opts = {
					container: document.getElementById("viz"),
					userdata: {
						hoverevents : true,
			            factors: factors_array
					}
				};

				graph = new HGraph(opts);
				graph.height = 200;
				graph.width = 200;
				graph.initialize();
				$('.g-toggle').on ('click', function(){
					graph.zeroGraph();
				});
				$('.label').remove;
				$('#viz').css('margin-left', '-35px');
				$('.overall').css('font-size', '2rem');
   			}
		}
	}
});

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
			url: '/tests/getuser',
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
	$('#submit').attr('value', 'Create New');
	$('#submit').on ('click', function(event){
		window.location = '?';
	});
	userarray = [];
	var User = Backbone.Model.extend({
		initialize: function(){
			this.isParseing = true;
			userarray.push(this);
		},
		parse: function(response, options) {
			if (!options.fetch) {
				var parent = this;
				$.ajax({
				    type: 'GET',
				    url: "/tests/getuserparams.json?user_id=" + response.user_id,
				    dataType: 'json',
				    success: function(params) {
	    				var res = $.extend({}, response, params[0]);
						parent.set(res);
				    },
				    data: {}
				});
				this.isParseing = false;
				return response;
			} else {
				return response;
			}
		}
	})
	var Users = Backbone.Collection.extend ({
		model: User,
		url: "/tests/getsubmissions.json"
	})
	
	var UserTable = Backbone.View.extend({
		tagName: "table",
		className: "user-table",
		initialize: function() {
			this.collection.fetch();
			this.listenTo(this.collection, "reset", this.newListeners);
		},
		newListeners: function() {
			var parent = this;
			this.collection.each(function(usr) {
				console.log(usr)
				parent.listenTo(usr, "change", parent.render);
			});
		},
		render: function() {
			console.log('in here')
			Array.prototype.insert = function (index, item) {
			  this.splice(index, 0, item);
			};
			for(var i = 0; i < userarray.length; i++) {
				if ($.inArray(userarray[i], this.collection.models) == -1)
					try {
						this.collection.models.insert(i, userarray[i]);
					} catch(ex){
						this.collection.models.push(userarray[i]);
					}
			}
			this.collection.length = userarray.length;
  			var innerhtml = $("<table class=\"table table-bordered user-table\"><tbody>");
  			console.log(this.collection);
  			div_onclick = function(pemail) {
					console.log('onclick mixer init ' + pemail);
            		window.location = ("?email=" + pemail+"&readonly=true");
  			};
  			
			$('#' + this.id).html(innerhtml);
			this.collection.each( function (usr) {
		        var c = usr.get('created_at').split("T");
		        var u = usr.get('updated_at').split("T");
				// hRenderZone.insertAdjacentHTML('beforeend', '<div  data-email="' + params[0].email + '" id="hasemail" onmouseover="this.style.background=&#x27gray&#x27" onmouseout="this.style.background=&#x27#f6f7f6&#x27" class="hasemail' + value.user_id + '" ><tr><font color="#000000"><td>' + full_name + '</td><td>' + value.user_id + '</td><td>' + value.message + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr></font></div>');
				// hRenderZone.insertAdjacentHTML('beforeend', '<tr data-email="' + params[0].email + '" id="hasemail" onmouseover="this.style.background=&#x27gray&#x27" onmouseout="this.style.background=&#x27#f6f7f6&#x27" class="hasemail' + value.user_id + '" ><td>' + full_name + '</td><td>' + value.user_id + '</td><td>' + value.message + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr>');
				if(usr.get('email') != undefined) {					
					innerhtml.append('<tr data-email="' + usr.get('email') + '" id="hasemail" class="hasemail' + usr.get('user_id') + '" ><td>' + usr.get('full_name') + '</td><td>' + usr.get('user_id') + '</td><td>' + usr.get('message') + '</td><td>' + c[0] + '</td><td>' + u[0] + '</td></tr>');
					innerhtml.find('.hasemail' + usr.get('user_id')).on ("click", function() { console.log('in here'); div_onclick($(this).attr('data-email')); });
				} else {
					var row = $('<tr><td class="loading" colspan = "5">Loading<td></tr>')
					innerhtml.append(row);
					var fadeInFadeOut = function(which, row){
							if(which){
								row.fadeTo("slow", 0.5, function() {
			   						 fadeInFadeOut(false, row);
								});
							} 
							else {
								row.fadeTo("slow", 1, function() {
			   						 fadeInFadeOut(true, row);
								});
							}
					}
					fadeInFadeOut(true, row);
				}
			});
		}
	});
	console.log('submissions on click');
	
	
	
	
	var cookieEmail = getCookie('email');
	console.log('email = ' + cookieEmail);

	hRenderZone = document.getElementById("metrics")
			|| document.getElementById("context")
			|| document.getElementById("hMixer");

	hRenderZone.innerHTML = "";
	usertable = new UserTable({collection: new Users(), id: "metrics"});

  // hRenderZone.insertAdjacentHTML('beforeend', '</table>');


}));

console.log($.getUrlVar('readonly'))

if ($.getUrlVar('readonly')==='true') {
	$('#submit').attr('value', 'Create New');
	$('#submit').on ('click', function(event){
		window.location = '?';
	});
}
else {
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
	
						gender = Mixer.getGender();
	
						metric = Mixer.getMetric();
						for (index = 0; index < metric.length; index++) {
	
							console.log('metric index = ' + JSON.stringify(metric[index]) + ', ' + index);
							
	
						}
	
						
						metriclength = metric.length;
	
						mixer = JSON.stringify(Mixer.getMetric());
	
						length = mixer.length;
						console.log(JSON.stringify(metric[0]));
						if (metric[0]['name'] != metric[Math.abs((metric.length-1)/2)]['name']) {
	
							/* get female metric from the default user */
	
							// $('#email').val('drdefacto@defactomd.com');
	
							// gender = 'female';
	
							// defactometric = Mixer.getMetric();
							// console.log('defacto metric = ' + defactometric);
	
							// defactostring = JSON.stringify(defactometric);
							// console.log('defacto string = ' + defactostring);
							secondMetric = metric
							len = secondMetric.length
							var i;
							for (i = 0; i < len; i++) {
								metric.push(secondMetric[i]);
								console.log('in here')
							}
							// metric.push(metric[0]);
							// metric.push(JSON.parse('{"name":"LDL","dayvalue":false,"healthyrange":[63,148],"totalrange":[0,160],"weight":5,"unitlabel":"mg/dl"}'));
							mixerMetrics = metric;
	
	
						} else {
	
							mixerMetrics = metric;
	
						}
	
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
								url: '/tests/create',
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
		} else {
	
			$.ajax({
				method: 'post',
		         	beforeSend: function(xhr){
					var token = $("meta[name='csrf-token']").attr("content");
					xhr.setRequestHeader("X-CSRF-Token", token);
				},
				url: '/tests/create',
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
}
})();
