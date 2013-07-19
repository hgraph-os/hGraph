
module.exports = function(grunt) {
    
    // load nifty npm tasks
    grunt.loadNpmTasks('grunt-smash');
    grunt.loadNpmTasks('grunt-yui-compressor');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-benchmark');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadTasks('lib/grunt');
    
    // define grunt configuration
    grunt.initConfig({
        
        clean : ['build','docs'],
        
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
        
        karma : {
            options : {
                configFile : 'karma.conf.js'  
            },
            unit : { 
                background : true
            }  
        },
        
        watch : {
            karma: {
                files: ['src/**/*.js', 'tests/**/*.spec.js'],
                tasks: ['clean','smash','publish:unmin','min','publish:min'] 
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
        },
        
        benchmark : {
          all: {
            src: ['benchmarks/*.js'],
            dest: 'benchmarks/results.csv'
          }
        },
        
        jsdoc : {
          build : { 
            src : 'build/hgraph.js',
            options : {
              destination : 'docs'
            }
          }
        }
        
    });
    
    grunt.registerTask('build', ['clean','smash','min','publish']);
    grunt.registerTask('package', ['build','karma']);
    grunt.registerTask('default', ['package']);
    
};