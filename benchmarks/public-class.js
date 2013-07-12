function PublicClass( ) {
  this.name = 'nobody';
};
PublicClass.prototype = { 
  SayHello : function( ) {
    return 'hello, my name is ' + this.name;
  }
};

module.exports = function( ) {
  
  var person = new PublicClass( );
  person.name = 'robby';
  var greeting = person.SayHello( );
  
};