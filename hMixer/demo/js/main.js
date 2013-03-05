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
		]}];*/


/* example ajax method setup */



if (cookieEmail != null) {
	ajaxconf = {
	    url      : "/tests/metrics.json?email=" + cookieEmail,
	    callback : onloaded
	};
} else  {
	ajaxconf = {
	    url      : "/tests/metrics.json",
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
			url: '/tests/getuser',
			data: {
				'email' : email
			},
			dataType: 'json',
			async: false,
			
			complete: function(jqXHR) {
				if(jqXHR.readyState === 4) {
	       			if(jqXHR.status == 200){
						var str = jqXHR.responseText;
						str = str.substring(str.indexOf('<body>')+6, str.indexOf('</body>'))
						console.log(str);
						var json = $.parseJSON(str);	
						console.log(json);	
						$('#name').val(json['name']);
						$('#message').val(json['message']);
	       			}
	       		}
	    	}        
			
		});
	}
}

/* ajax submit to server */
$('#submit').on('click', function(event){
	if (cookieEmail == null) {
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
				if($('#email').val() != "" && $('#name').val() != "" && $('#message') != "") {
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
								'mixer' : JSON.stringify(Mixer.getMetric()),
								'gender' : Mixer.getGender(),
								'email' : $('#email').val(),
								'name' : $('#name').val(),
								'message' : $('#message').val()
							},
							dataType: 'json',
							async: false,
							success: function(data) {
								console.log('success');
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
		$.ajax({
			method: 'post',
	         beforeSend: function(xhr){  var token = $("meta[name='csrf-token']").attr("content");
	  xhr.setRequestHeader("X-CSRF-Token", token);},
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
				console.log('success');
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
		
});

})();
