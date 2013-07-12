function PrivateClass( ) {
  
  var _name = 'nobody';
  
  this.SayHello = function( ) {
    return 'hello, my name is ' + _name;
  };
  
  this.SetName = function( name ) {
    _name = name;
  };
  
};

module.exports = function( ) {
  
  var person = new PrivateClass( );
  person.SetName( 'robby' );
  var greeting = person.SayHello( );
  
};