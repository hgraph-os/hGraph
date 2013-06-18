
module.exports = function(grunt) {
    
    // load nifty npm tasks
    grunt.loadNpmTasks('grunt-smash');
    grunt.loadNpmTasks('grunt-yui-compressor');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadTasks('lib/grunt');
    
    // define grunt configuration
    grunt.initConfig({
        
        clean : ['build'],
        
        smash : {
            package : { 
                src: 'src/hgraph.js',
                dest: 'build/hgraph.js'
            }
        },
        
        min : {
            package : {
                src: 'build/hgraph.js',
                dest: 'build/hgraph.min.js'
            }
        },
        
        publish : {
            unmin : { 
                src: 'build/hgraph.js',
                dest: ['examples/canvas/js/']
            },
            min : { 
                src: 'build/hgraph.min.js',
                dest: ['examples/canvas/js/']
            }
        }
        
    });
    
    grunt.registerTask('package', ['clean','smash','min','publish']);
    grunt.registerTask('default', ['package']);
    
};