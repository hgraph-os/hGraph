
var Attribute = Backbone.Model.extend({

	defaults: {
		metric: [{
				name: 'LDL',
				dayvalue: 'false',
				healthyrange: [63, 148],
				totalrange: [0, 160],
				weight: 5,
				unitlabel: 'mg/dl'
			}, {
				name: 'HDL',
				dayvalue: 'false',
				healthyrange: [28, 102],
				totalrange: [0, 130],
				weight: 7,
				unitlabel: 'mg/dl'
			}, {
				name: 'Triglycerides',
				dayvalue: 'false',
				healthyrange: [291, 454],
				totalrange: [0, 600],
				weight: 3,
				unitlabel: 'mg/dl'
			}, {
				name: 'Sleep',
				dayvalue: 'false',
				healthyrange: [6, 9],
				totalrange: [0, 18],
				weight: 5,
				unitlabel: 'hours/night'
			}
			]
	},

	initialize: function(email) {

		console.log('email = ' + JSON.stringify(email) + ' email = ' + email.email);

		this.url = 'http://192.168.1.127:3000/tests/metrics.json?email=' + email.email;

		console.log('url = ' + this.url);

	},

	parse: function(response) {
		console.log('attribute parse response = ' + JSON.stringify(response));
		return response;
	}

});

var models = Backbone.Collection.extend( {

	model: Attribute

} );

var data = new Attribute({email: 'drdefacto@defactomd.com'});

// models.add(data);

data.fetch({

	success: function() {
		console.log('data.fetch success');
	},

	error: function() {
		console.log('data.fetch error');
	}
}).done(function(){ console.log('fetch done, data = ' + JSON.stringify(data)); } );



console.log('attribute data = ' + JSON.stringify(data));

