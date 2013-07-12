/**
 * @overview A canvas drawing engine for hGraph
 * @copyright Involution Studios 2013 <http://goinvo.com>
 * @license Apache 2.0
 * @author Danny Hadley <danny@goinvo.com>
 * @version 1.0 
 */

(function hGraph( global ) {

var // hGraph namespace definition
  hGraph = { },
    
  d3 = { },
  
  // private (h) variables
  hRootElement = false,
  hGraphInstances = { },
  hResizeCallbacks = [ ];

import "vendor/"
import "defaults/"
import "error/"
import "helpers/"
import "data/"
import "graph/"

/** 
 * @private
 * @function hWindowResize
 * @description callback for window resizing. loops through an array of resizing functions, calling them
 */
function hWindowResize( ) { 
  forEach( hResizeCallbacks, function( fn )  {
    return isFn( fn ) && fn( ); 
  });
};

/** 
 * @private
 * @function hCreateGraph
 * @description creates a graph instance with a container
 * @param {Object} container The container to append the graph rendering context into
 */
function hCreateGraph( container ){
  var uid = createUID( );
  hGraphInstances[uid] = new hGraph.Graph({ uid : uid, container : container });
};

/** 
 * @private
 * @function hGraphInit
 * @description initializes all instances of 'hGraph-graph' flagged elements
 */
function hGraphInit( ) {
  d3.select( DEFAULTS['HGRAPH_GRAPH_BOOTSTRAPS'].join(',') ).each(function( ){
      hCreateGraph( this );
  });
  
  for( var uid in hGraphInstances )
      hGraphInstances[uid].Initialize( );
};

/** 
 * @private
 * @function hGraphBootStrap
 * @description called on document ready 
 */
function hGraphBootStrap( ) {
  // an array of matches
  var matches = [ ];
  d3.select( DEFAULTS['HGRAPH_APP_BOOTSTRAPS'].join(',') ).each(function( ){
      matches.push( this );
  });
  // do not proceed if more than one 
  if( matches.length > 1 )
      throw new hGraph.Error('Too many root elements found on the page');
      
  hRootElement = matches[0];
  
  // if the 'hgraph-app' attribute was found, we can initialize
  if( hRootElement )
      return hGraphInit( );
};

d3.select( document )
  .on( 'DOMContentLoaded', hGraphBootStrap )
  .on('touchmove', function( ) {  
    d3.event.preventDefault && d3.event.preventDefault( );
  });
  
d3.select( window ).on( 'resize', hWindowResize );

// expose hGraph to the window
global.hGraph = hGraph;

})( window );