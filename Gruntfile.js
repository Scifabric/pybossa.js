module.exports = function(grunt) {

  grunt.initConfig({
    qunit: {
      all: ['tests/**/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('test', ['qunit']);
}
