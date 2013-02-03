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
        "features" : { 
            "saferange"  : [50, 60],
            "totalrange" : [0, 60],
            "weight"     : 10,
            "unitlabel"  : "mg/dL"
        }
    },{
        "name"     : "HDL",
        "features" : { 
            "saferange"  : [0, 97],
            "totalrange" : [0,130],
            "weight"     : 1,
            "unitlabel"  : "%"
        }
    },{
        "name"     : "Triglycerides",
        "features" : { 
            "saferange"  : [0, 150],
            "totalrange" : [0, 600],
            "weight"     : 3,
            "unitlabel"  : "mg/dL"
        }
    }]
},{
    "gender"  : "female",
    "metrics" : [{
        "name"     : "LDL",
        "features" : { 
            "saferange"  : [50, 60],
            "totalrange" : [0, 60],
            "weight"     : 10,
            "unitlabel"  : "mg/dL"
        }
    },{
        "name"     : "HDL",
        "features" : { 
            "saferange"  : [0, 97],
            "totalrange" : [0,130],
            "weight"     : 1,
            "unitlabel"  : "%"
        }
    },{
        "name"     : "Triglycerides",
        "features" : { 
            "saferange"  : [0, 150],
            "totalrange" : [0, 600],
            "weight"     : 3,
            "unitlabel"  : "mg/dL"
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
    allowTextSelection : false
    // safe_range         : [0, 400],
    // total_range        : [0, 800]
    // range_fill : "#ff0000" 
    // text_fill  : "#ff0000"
};

ready = function () {
    Mixer.init(ajaxconf, options); // initialize the Mixer (ajax version)
    //Mixer.init( metrics );       // initialize the Mixer (array version)
};

Entry( ready ); // Use the Entry funciton defined in Utils

})();