js_files = ['Gruntfile.js', 'src/public/javascript/**/*.js', 'server.js', 'src/server/**/*.js'];

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: js_files
    },

    stylus: {
      compile: {
        options: {

        },
        files: {
          'src/public/stylesheets/style.css': 'src/stylus/main.styl'
        }
      }
    },

    watch: {
      options: {
        livereload: true,
      },

      scripts: {
        files: js_files,
        tasks: ['jshint'],
        options: {
          spawn: false
        }
      },

      css: {
        files: ['src/stylus/*.styl'],
        tasks: ['stylus'],
        options: {
          spawn: false
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint', 'stylus','watch']);
};
