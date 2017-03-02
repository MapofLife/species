
module.exports = function(grunt) {
  var path = require('path');
  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,

    dom_munger: {
      main: {
        options: {

           xmlMode: true,

            read: [
              {selector:'link.dev',attribute:'href',writeto:'cssRefs',isPath:true},
              {selector:'script.dev',attribute:'src',writeto:'jsRefs',isPath:true}
            ],
            remove: ['.dev','.delete'],
            prepend: [
              {selector:'head',html:'<meta id="mol-asset-base" content="//mapoflife.github.io/' + pkg.base + '/"></meta>'},
              {selector:'head',html:'<base href="//mapoflife.github.io/"></base>'},
            ],
            append: [
              {selector:'head',html:'<link href="' + pkg.base + '/static/app.min.css?'+Math.random()+'" rel="stylesheet"></link>'},
              {selector:'html',html:'<script src="' + pkg.base + '/static/app.min.js?'+Math.random()+'"></script>'}
            ]
        },
        src: 'src/index.html',
        dest: 'dist/index.html'
      },
    },
    cssmin: {
      main: {
        src:'<%= dom_munger.data.cssRefs %>', //use our read css references and concat+min them
        dest:'dist/static/app.min.css'
      }
    },
    uglify: {
      options: {mangle: false},
      main: {
        src: '<%= dom_munger.data.jsRefs %>', //use our read js references and concat+min them
        dest:'dist/static/app.min.js'
      }
    },
    copy : {
      main: {
        files: [
          { expand:true, nonull: true, cwd: 'src', src: ['static/app/**/*.{html,png,jpg}'],
          dest: 'dist/'}
        ],
      },
    },
    watch: {
      dist: {
        files: ['src/**/*.*'],
        tasks: ['build'],
        options: {
          livereload: true
        }
      },

        src: {
          files: ['src/**/*.*'],
          options: {
            livereload: true
          }
        }
    },
    buildcontrol: {
     options: {
       dir: 'src',
       commit: true,
       branch: 'gh-pages',
       push: true,
       message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
     },
     pages_dev: {
       options: {
         remote: pkg.devRepository,
         force:true,
         branch: 'gh-pages'
       }
     },
     pages: {
       options: {
         remote: pkg.repository,
         force: true,
         branch: 'gh-pages'
       }
     }
   },
   express: {
    src: {
      options: {
        port: 9001,
        //livereload: true,
        bases: 'src',
        server: path.resolve('./server/srcServer')
      }
    },
    dist: {
      options: {
        port: 9001,
        bases: 'dist',
        server: path.resolve('./server/distServer')
      }
    }
  },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-build-control');
  //grunt.loadNpmTasks('grunt-keepalive');
  grunt.loadNpmTasks('grunt-open');

  // Default task(s).
  grunt.registerTask('build', ['dom_munger','uglify','cssmin','copy']);
  grunt.registerTask('serveSrc', ['express:src',  'watch:src'])
  grunt.registerTask('serveDist', ['express:dist',  'watch:dist'])
  grunt.registerTask('deployDev', ['buildcontrol:pages_dev']);
  grunt.registerTask('deploy', ['buildcontrol:pages']);

};
