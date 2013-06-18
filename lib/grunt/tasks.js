var grunt = require('grunt');

module.exports = function(grunt) {
    
    grunt.registerMultiTask( 'publish', 'Publishing files', function( ) { 
        if( !this.data['src'] )
            return grunt.fail.warn('no source files specified to publish');
        if( !this.data['dest'] || !this.data['dest'].length )
            return grunt.fail.warn('no destination folders specified to publish to');
        
        var srcPath = this.data['src'],
            srcFile = srcPath.replace(/^.*\/(.*\.js)$/,"$1"),
            destPath;
            
        for( var i = 0; i < this.data['dest'].length; i++ ) { 
            destPath = this.data['dest'][i] + srcFile;
            grunt.file.copy( srcPath, destPath );
            grunt.log.ok('moved ' + srcPath + ' to ' + destPath );
        }
        
    });
      
};