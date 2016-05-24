<<<<<<< HEAD

=======
var rewrite = require('connect-modrewrite');
>>>>>>> ccb50a42c8ed4f40a10eb505b500e3df1089ed3c
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dom_munger: {
      main: {
        options: {
            read: [
              {selector:'link.dev',attribute:'href',writeto:'cssRefs',isPath:true},
              {selector:'script.dev',attribute:'src',writeto:'jsRefs',isPath:true}
            ],
            remove: ['.dev'],
            append: [
              {selector:'head',html:'<link href="static/app.min.css" rel="stylesheet">'},
              {selector:'head',html:'<script src="static/app.min.js"></script>'}
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
<<<<<<< HEAD
   files: [
     // includes files within path
     { expand:true, nonull: true, cwd: 'src', src: ['static/app/**/*.{html,png,jpg}'], dest: 'dist/'}
   ],
 },
=======
        files: [
          // includes files within path
          { expand:true, nonull: true, cwd: 'src', src: ['static/app/**/*.{html,png,jpg}'], dest: 'dist/'}
        ],
      },
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: '',
          keepalive: true,
          // http://danburzo.ro/grunt/chapters/server/
          middleware: function(connect, options, middlewares) {
            // 1. mod-rewrite behavior
            var rules = [
                '!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
            ];
            middlewares.unshift(rewrite(rules));
            return middlewares;
          }
        },
        proxies: [
               {
                   context: '/species',
                   host: 'localhost',
                   port: 9001
               }
           ]
      }
    },
    watch: {
      scripts: {
        files: ['src/*'],
        tasks: ['dom_munger','uglify','cssmin','copy'],
        options: {
          spawn: false,
        },
      },
>>>>>>> ccb50a42c8ed4f40a10eb505b500e3df1089ed3c
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
<<<<<<< HEAD
=======
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-connect-rewrite');
>>>>>>> ccb50a42c8ed4f40a10eb505b500e3df1089ed3c

  // Default task(s).
  grunt.registerTask('default', ['dom_munger','uglify','cssmin','copy']);

<<<<<<< HEAD
=======
  grunt.registerTask('server', function (target) {
    grunt.task.run([
        'configureProxies:server',
        'connect:server',
        'watch'
    ]);
});

>>>>>>> ccb50a42c8ed4f40a10eb505b500e3df1089ed3c
};
