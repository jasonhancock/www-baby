module.exports = function(grunt) {
    grunt.initConfig({
        assetBase: './dist',
        assetDir: "<%= assetBase %>",

        clean: {
            assets: {
                src:['<%= assetBase %>'],
            },
        },

        concat: {
            options: {
                separator: ';',
            },
            js_site: {
                src: [
                    './bower_components/jquery.terminal/js/jquery.terminal-0.8.8.js',
                    './src/js/site.js'
                ],
                dest: '<%= assetDir %>/js/site.min.js',
            },
        },

        uglify: {
            options: {
                mangle: false
            },
            site: {
                files: {
                    '<%= assetDir %>/js/site.min.js': '<%= assetDir %>/js/site.min.js'
                },
            },
        },

        less: {
            development: {
                options: {
                    compress: true
                },
                files: {
                    "<%= assetDir %>/css/site.min.css": "./src/less/site.less"
                },
            },
        },

        watch: {
            js_site: {
                files: [
                    './bower_components/jquery.terminal/js/jquery.terminal-0.8.8.js',
                    './src/js/site.js'
                ],
                tasks: ['concat:js_site', 'uglify:site']
            },
            less: {
                files: [
                    './src/less/*.less',
                    './bower_components/jquery.terminal/css/jquery.terminal.css'
                ],
                tasks: ['less']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('all', ['concat', 'uglify', 'less']);
};
