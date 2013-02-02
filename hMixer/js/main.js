/* ******************************************************* *
 * Main.js - Example useage of the Mixer class             *
 * http://hgraph.org/hMixer                                *
 * Author(s):                                              *
 *  - Danny Hadley <danny@goinvo.com>                      *
 * ******************************************************* */
(function () {
    
    var ready,   // the ready function
        metrics; // the metrics to populate with (optional)

metrics = [{
    name     : "LDL",
    features : {
        
    }
},{
    name     : "LDL",
    features : {
        
    }
}];

ready = function () {
    Mixer.init({ url : "tests/metrics.json" }); // initialize the Mixer (ajax)
    //Mixer.init( metrics );                    // initialize the Mixer (array)
};

Entry( ready ); // Use the Entry funciton defined in Utils

})();