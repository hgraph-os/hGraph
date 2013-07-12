var _concat = [ ].concat;
var _slice = [ ].slice;

function _inject( fn, args, context ) {
  return (function( ) { 
    var narg = arguments.length > 0 ? _slice.call( arguments, 0 ) : [ ];
    return fn.apply( context, args.concat( narg ) );
  });
};

function SetName( locals, name ) {
  locals['name'] = name;
};

function SayHello( locals ) {
  return 'hello, my name is ' + locals['name'];
}; 

function InjectionClass( ) {
  var local = { name : 'nobody' };
  
  this.SetName = _inject( SetName, [ local ], this );
  this.SayHello = _inject( SayHello, [ local ], this );
};

module.exports = function( ) {
  var i = new InjectionClass( );
  i.SetName('danny');
  var b = i.SayHello( );
};