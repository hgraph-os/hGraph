/*! HGraph.js
 * Authors:
 *  Michael Bester <michael@kimili.com>
 *  Ivan DiLernia <ivan@goinvo.com>
 *  Danny Hadley <danny@goinvo.com>
 *  Matt Madonna <matthew@myimedia.com>
 *
 * License:
 * Copyright 2012, Involution Studios <http://goinvo.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
(function( global ) {

var // hGraph namespace definition
    hGraph = { },
    
    // jQL and d3 namespaces defined in vendor
    jQL = { },
    d3 = { },
    
    // private (h) variables
    hRootElement = false,
    hGraphInstances = { };

import "vendor/"
import "defaults/"
import "helpers/"
import "graph/"

// ----------------------------------------
// hGraph bootstrapping

// hCreateGraph
// creates the hgraph inside the container parameter
function hCreateGraph( container ){
    var uid = createUID( );
    hGraphInstances[uid] = new hGraph.Graph({ uid : uid, container : container });
};

// hGraphInit
// called once the root element has been found during the bootstrapping
// function call. takes care of populating the graphs on the page
function hGraphInit( ) {

    // try using the bootstrap selections to find elements
    jQL( DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'] ).each(function(indx, trigger) {
        var matches = jQL("["+trigger+"]");
        // loop through the elements to create graphs inside them
        for( var i = 0; i < matches.length; i++ )
            hCreateGraph( matches[i] );
    });
    for( var uid in hGraphInstances )
        hGraphInstances[uid].Initialize( );
};

// hGraphBootStrap
// document ready callback. will search the page for an element with either
// a 'data-hgraph-app' or 'hgraph-app' attribute and save it as the root element
function hGraphBootStrap( ) {
    jQL( DEFAULTS['HGRAPH_APP_BOOTSTRAPS'] ).each(function(indx, trigger) {
        // try to find an element with the application bootstrap attribute
        var matches = jQL("["+trigger+"]");
        if( matches.length > 0 )
            hRootElement = matches.first( );
    });
    // if the 'hgraph-app' attribute was found, we can initialize
    if( hRootElement !== false )
        return hGraphInit( );
};

jQL(document).ready( hGraphBootStrap );

// expose hGraph to the window
global.hGraph = hGraph;

})( window );