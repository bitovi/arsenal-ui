module.exports = function (grunt) {
  // load tasks from NPM modules
  grunt.loadNpmTasks('steal-tools');
  grunt.loadNpmTasks('testee');

  // Configure the tasks we loaded.
  grunt.initConfig({
    stealBuild: {
      main: {
        options: {
          system: {
            config: __dirname + "/stealconfig.js",
            main: "index",
          },
          buildOptions: {
            bundleSteal: true
          }
        }
      }
    },

    testee: {
      local: {
        src: ['./test/test.html'],
        options: {
          browsers: ['phantom'],
          reporter: 'Spec'
        }
      }
    }
  });

  // `grunt build`
  grunt.registerTask('build', ['stealBuild']);
  // `grunt test`
  grunt.registerTask('test', ['testee']);

  // Tell grunt what to do when we just run `grunt`
  grunt.registerTask('default', ['test', 'build']);
};
