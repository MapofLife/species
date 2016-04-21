
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
        src: 'index.dev.html',
        dest: 'index.html'
      },
    },
    cssmin: {
      main: {
        src:'<%= dom_munger.data.cssRefs %>', //use our read css references and concat+min them
        dest:'static/app.min.css'
      }
    },
    uglify: {
      options: {mangle: false},
      main: {
        src: '<%= dom_munger.data.jsRefs %>', //use our read js references and concat+min them
        dest:'static/app.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['dom_munger','uglify','cssmin']);

};
