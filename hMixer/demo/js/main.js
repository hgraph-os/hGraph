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

    console.log( Mixer.getMetric("hdl") );  

};


/* example array for metric structures */
metrics = [{
    name     : "LDL",
    features : { }
},{
    name     : "LDL",
    features : { }
}];

/* example ajax method setup */
ajaxconf = {
    url      : "tests/metrics.json",
    callback : onloaded
};

/* example usage of the "options" parameter */
options = {
    allowTextSelection : false
    // healthy_range         : [0, 400],
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