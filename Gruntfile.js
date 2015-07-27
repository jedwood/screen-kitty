
module.exports = function(grunt) {

  grunt.initConfig({
    meta: {
      endpoint: ""
    },
    stylus: {
      compile: {
        options: {compress: false},
        files: {
            'styles/screen.css': 'styles/screen.styl'
          }
      }
    },
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: [
          {expand: true, src: '**/*.jade', ext: '.html'}
        ]
      }
    },
    browserify: {
      dist: {
        files: {
          'scripts/bundle.js': ['scripts/main.js'],
        },
        options: {
          browserifyOptions: {
            standalone: 'Kitty'
          }
        }
      }
    },
    watch: {
      html: {
        files: '**/*.jade',
        tasks: ['jade'],
        options: {
          interrupt: true
        }
      },
      css: {
        files: ['styles/*.styl'],
        tasks: ['stylus:compile'],
        options: {
          interrupt: true
        }
      },
      js: {
        files: ['scripts/*.js'],
        tasks: ['browserify:dist'],
        options: {
          interrupt: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['stylus', 'jade', 'browserify']);

};
