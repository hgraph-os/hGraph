/* ******************************************************* *
 * Main.js - Example useage of the Mixer class             *
 * http://hgraph.org/hMixer                                *
 * Author(s):                                              *
 *  - Danny Hadley <danny@goinvo.com>                      *
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


/* example array for metric structures */
metrics = [{
    "gender"  : "male",
    "metrics" : [{
        "name"     : "LDL",
        "dayvalue" : 10,
        "features" : { 
            "healthyrange"  : [0, 130],
            "totalrange"    : [0, 160],
            "boundaryflags" : [true, true],            
            "weight"        : 6,
            "unitlabel"     : "mg/dL"
        }
    },{
        "name"     : "HDL",
        "features" : { 
            "healthyrange"  : [50, 60],
            "totalrange"    : [0, 60],
            "boundaryflags" : [false, true],
            "weight"        : 6,
            "unitlabel"     : "mg/dL"
        }
    },{
        "name"     : "Triglycerides",
        "features" : { 
            "healthyrange"  : [0, 150],
            "totalrange"    : [0, 600],
            "boundaryflags" : [false, true],
            "weight"        : 5,
            "unitlabel"     : "mg/dL"
        }
    },
        {
        "name"     : "Sleep",
        "features" : { 
            "healthyrange"  : [7, 10],
            "totalrange"    : [0, 18],
            "boundaryflags" : [false, true],
            "weight"        : 3,
            "unitlabel"     : "hours/night"
        }
    }]
},{
    "gender"  : "female",
    "metrics" : [{
        "name"     : "LDL",
        "features" : { 
            "healthyrange"  : [0, 100],
            "totalrange"    : [0, 160],
            "boundaryflags" : [false, true],
            "weight"        : 4,
            "unitlabel"     : "mg/dL"
        }
    },{
        "name"     : "HDL",
        "features" : { 
            "healthyrange"  : [40, 60],
            "totalrange"    : [0, 60],
            "boundaryflags" : [false, true],
            "weight"        : 2,
            "unitlabel"     : "mg/dL"
        }
    },{
        "name"     : "Triglycerides",
        "features" : { 
            "healthyrange"  : [0, 150],
            "totalrange"    : [0, 600],
            "boundaryflags" : [false, true],
            "weight"        : 3,
            "unitlabel"     : "mg/dL"
        }
    },{
        "name"     : "Sleep",
        "features" : { 
            "healthyrange"  : [7, 10],
            "totalrange"    : [0, 18],
            "boundaryflags" : [false, true],
            "weight"        : 3,
            "unitlabel"     : "hours/night"
        }
    }]
}];

/* example ajax method setup */
ajaxconf = {
    url      : "tests/metrics.json",
    callback : onloaded
};

/* example usage of the "options" parameter */
options = {
    allowTextSelection : false,
    // read_only : true
    // healthy_range         : [0, 400],
    // total_range        : [0, 800]
    // range_fill : "#ff0000" 
    // text_fill  : "#ff0000"
};

ready = function () {
    // Mixer.init(ajaxconf, options); // initialize the Mixer (ajax version)
    Mixer.init( metrics, options);       // initialize the Mixer (array version)
};

Entry( ready ); // Use the Entry funciton defined in Utils

})();