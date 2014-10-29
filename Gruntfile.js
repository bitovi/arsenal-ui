var url = require('url');
var send = require('send');
var morgan = require('morgan');

module.exports = function (grunt) {
  // load tasks from NPM modules
  grunt.loadNpmTasks('steal-tools');
  grunt.loadNpmTasks('testee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadTasks('tasks/write-files');

  // Create some configuration settings.
  var buildDir = __dirname + '/dist/bundles';

  // Configure the tasks we loaded.
  grunt.initConfig({
    stealBuild: {
      main: {
        options: {
          system: {
            config: __dirname + "/stealconfig.js",
            main: "index",
            bundlesPath: buildDir
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
    },

    shell: {
      // create a release of the project
      release: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: function(releaseType) {
          releaseType = releaseType ? releaseType.toString().toLowerCase() : 'patch';

          var validTypes = ['patch', 'minor', 'major'];
          if(validTypes.indexOf(releaseType) < 0) {
            grunt.warn('Release type must be one of "' + validTypes.join('", "') + '".');
            return;
          }

          return [
            // pull new branches
            'git remote update',
            // start from develop
            'git checkout develop',
            // make sure develop is up to date
            'git pull --ff-only',
            // merge develop into origin/master (not local master!)
            'git merge origin/master --ff-only',
            // update the version in package.json
            // (I'd love to update it in bower.json also, but it'd mean 2 tags and 2 commits)
            'npm version ' + releaseType + " -m 'Upgrading to %s'",
            // switch to master
            'git checkout master',
            // pull the latest from origin (which was just merged to)
            'git pull --ff-only',
            // merge master back on top of develop
            'git merge develop --ff-only',
            // return to develop
            'git checkout develop'
          ].join(' && ');
        }
      },

      // publish the project
      publish: {
        options: {
          stdout: true,
          failOnError: true
        },
        command: function() {
          // TODO: have this send an email
          return [
            // push develop and master from local to origin
            'git push origin develop:develop',
            'git push origin master:master',
            // push the tag that `grunt shell:release` created
            'git push --tags'
          ].join(' && ');
        }
      }

    },

    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 8080,
          keepalive: true,
          middleware: [
            morgan(':method :url :status'),
            function(req, res, next) {
              var pathname = url.parse(req.url).pathname;
              if(pathname.indexOf('.') < 0 || pathname.substr(-5) === '.html') {
                send(req, __dirname + '/index.html').pipe(res);
              } else {
                send(req, __dirname + req.url).pipe(res);
              }
            }
          ]
        }
      }
    },

    clean: {
      build: [ buildDir ]
    },

    writeFiles: {
      build: {
        dstDir: buildDir
      }
    }

  });

  // `grunt test`
  grunt.registerTask('test', 'Run tests.', ['testee']);
  // `grunt build`
  grunt.registerTask('build', 'Make a build.', ['clean:build', 'stealBuild', 'writeFiles']);

  // `grunt release`
  grunt.registerTask('release', 'Create a release.', function(releaseType) {
    // run tests, do a build, then make a release
    grunt.task.run('test', 'build', 'shell:release' + (releaseType ? ':' + releaseType : ''));
  });
  // `grunt publish`
  grunt.registerTask('publish', 'Publish the project.', ['shell:publish']);

  // `grunt serve`
  grunt.registerTask('serve', 'Start an HTTP server.', ['connect:server']);
  grunt.registerTask('server', ['serve']);

  // Tell grunt what to do when we just run `grunt`
  grunt.registerTask('default', 'Run tests and make a build.', ['test', 'build']);
};
