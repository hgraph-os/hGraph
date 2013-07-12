var HybridClass = (function( ) {  

var hash = { };

function Hybrid( ) {
  var local = { };
  local['name'] = 'nobody';
  hash[this] = local;
};

Hybrid.prototype = {

  SayHello : function( ) {
    return 'hello, my name is ' + hash[this].name;
  },

  SetName : function( name ) {
    hash[this].name = name;
  }

};

return Hybrid;

})( );

module.exports = function( ) {
  
  var person = new HybridClass( );
  person.SetName( 'robby' );
  var greeting = person.SayHello( );
  
};