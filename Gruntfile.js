module.exports = function(grunt) {

  grunt.initConfig({
    qunit: {
      all: ['tests/index.html']
    },
    browserify: {
      main: {
        src: 'main.js',
        dest: 'pybossa.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('test', ['qunit']);
}
