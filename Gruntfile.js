var url = require('url');
var send = require('send');
var morgan = require('morgan');

module.exports = function (grunt) {
  // load tasks from NPM modules
  grunt.loadNpmTasks('steal-tools');
  grunt.loadNpmTasks('testee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadTasks('tasks/write-files');

  // Create some configuration settings.
  var buildDir = __dirname + '/dist/bundles';
  var proxyConfig = {
    localhost: 'localhost:8090',
    proxyhost: 'ma-rinst-lap01.corp.apple.com:8090'
  };

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
              var parsedURL = url.parse(req.url);

              var isHTMLPage = parsedURL.pathname.indexOf('.') < 0 || parsedURL.pathname.substr(-5) === '.html';

              var paths = [
                { prefix: '/components', sub: false },
                { prefix: '/models', sub: false },
                { prefix: '/resources', sub: false },
                { prefix: '/test', sub: false },
                { prefix: '/dist/bundles', sub: '/dist/bundles/index.html' },
                { prefix: '/', sub: '/index.html' }
              ];
              var sub;
              for(var i = 0; i < paths.length; ++i) {
                if(parsedURL.pathname.indexOf(paths[i].prefix) === 0) {
                  sub = paths[i].sub;
                  break;
                }
              }

              if(isHTMLPage && sub) {
                grunt.log.writeln('\x1b[33m' + parsedURL.pathname + ' -> ' + sub + '\x1b[0m');
                send(req, __dirname + sub).pipe(res);
              } else {
                send(req, __dirname + req.url).pipe(res);
              }

            }
          ]
        }
      },
      proxy: {
        options: {
          hostname: 'localhost',
          port: 8090,
          keepalive: true,
          middleware: function(connect, options) {
            var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
            return [
              function (req, res, next) {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Access-Control-Allow-Methods', '*');
                  next();
              },
              morgan('\x1b[35m:method :url\x1b[0m :status'),
              proxy
            ];
          }
        },
        proxies: [
          {
            context: '/',
            host: 'ma-rinsd-lapp01.corp.apple.com',
            port: 8090
          }
        ]
      }
    },

    concurrent: {
      servers: ['server', 'proxy'],
      options: {
        logConcurrentOutput: true
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

  // `grunt server`
  grunt.registerTask('server', 'Start an HTTP server.', ['connect:server']);
  // `grunt proxy`
  grunt.registerTask('proxy', 'Start the proxy server.', ['configureProxies:proxy', 'connect:proxy']);
  // `grunt serve`
  grunt.registerTask('serve', 'Start all servers.', ['concurrent:servers']);

  // Tell grunt what to do when we just run `grunt`
  grunt.registerTask('default', 'Run tests and make a build.', ['test', 'build']);
};
