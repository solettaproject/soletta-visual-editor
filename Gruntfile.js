/**
 *
 * @license
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Intel Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *
 **/
var spawn = require('child_process').spawn;

module.exports = function (grunt) {
  var lintOptions = {
    camelcase: false,
    curly: true,
    eqeqeq: true,
    forin: true,
    immed: true,
    indent: 2,
    noempty: true,
    quotmark: 'single',

    undef: true,

    // words which are allowed globally (or not)
    globals: {
      TheGraph: true,
      Mousetrap: false,
      require: false,
      define: false,
      module: false,
      console: false,
      React: false,
      System: false,
      Promise: false,
      Polymer: false,
      noflo: false
    },

    unused: true,
    browser: true,
    strict: true,
    trailing: true,
    maxdepth: 3,
    newcap: false // otherwise factory functions throw errors
  };

  grunt.initConfig({

    // custom element linting
    inlinelint: {
      all: ['app/elements/**/*.html'],

      // see http://jshint.com/docs/
      options: lintOptions
    },

    // pure js linting
    jshint: {
      all: ['app/js/**/*.js'],

      // see http://jshint.com/docs/
      options: lintOptions
    },

    uglify: {
      all: {
        files: [
          { expand: true, cwd: '.', src: ['app/js/*.js', '!app/js/amd.js'], dest: 'dist/' }
        ]
      }
    },

    mochaccino: {
      all: {
        // use updated mocha
        // TODO modify grunt-mochaccino to newer mocha
        cmd: './node_modules/mocha/bin/mocha',
        files: [
          { src: 'test/unit/*.test.js' }
        ],
        reporter: 'spec'
      }
    },

    'wct-test': {
      local: {
        options: {
          // options listed here : <https://github.com/Polymer/web-component-tester/blob/master/runner/config.js>
          remote: false,
          root: '.', // else is .. (used for testing independent web components rather than in an app)
          persistent: !!process.env.SLV_PAUSE, // keeps the browser open - useful for debugging wct
          suites: [
            'test/elements/'
          ],
          plugins: {
            local: {
              browsers: (process.env.SLV_BROWSERS ?
                           process.env.SLV_BROWSERS.split(',') :
                           [ 'firefox', 'chrome' ])
            }
          }
        }
      }
    },

    'http-server': {

      'dev': {

          // the server root directory
          root: '.',

          // the server port
          // can also be written as a function, e.g.
          // port: function() { return 8282; }
          port: 8282,

          // the host ip address
          // If specified to, for example, "127.0.0.1" the server will
          // only be available on that ip.
          // Specify "0.0.0.0" to be available everywhere
          host: "0.0.0.0",

          //cache: <sec>,
          showDir : true,
          autoIndex: true,

          // server default file extension
          ext: "html",

          // run in parallel with other tasks
          runInBackground: false

      }

    },

    copy: {
      dist: {
        files: [

          // bower_components
          { expand: true, cwd: '.', src: ['bower_components/js-signals/dist/signals.min.js'], dest: 'dist/' },
          { expand: true, cwd: '.', src: ['bower_components/lodash/lodash.min.js'], dest: 'dist/' },
          { expand: true, cwd: '.', src: ['bower_components/q/q.js'], dest: 'dist/' },
          { expand: true, cwd: '.', src: ['bower_components/clearsans-1.00/WOFF/ClearSans-Regular.woff'], dest: 'dist/' },
          { expand: true, cwd: '.', src: ['bower_components/font-awesome/fonts/fontawesome-webfont.woff'], dest: 'dist/' },
          { expand: true, cwd: '.', src: ['bower_components/klayjs/klay.js'], dest: 'dist/' },

          // app/index-vulcanized.html
          { expand: false, cwd: '.', src: ['app/index-vulcanized.html'], dest: 'dist/app/index.html' },

          // app/data
          { expand: true, cwd: '.', src: ['app/data/*'], dest: 'dist/' },

          // app/assets
          { expand: true, cwd: '.', src: ['app/assets/*'], dest: 'dist/' },

          // favicon
          { expand: true, cwd: '.', src: ['app/favicon.ico'], dest: 'dist/' }
        ]
      }
    },

    vulcanize: {
      default: {
        options: {
          strip: true,
          inline: true
        },
        files: {
          'app/index-vulcanized.html': 'app/index.html'
        }
      },
    },

    build: {

      'npm-install': {
        cmd: 'npm',
        args: [
          'install'
        ],
        options: {
          cwd: '.',
          stdio: 'inherit'
        },
        exit: function (next) {
          return function () {
            grunt.task.run('loadNpmTasks');
            next();
          }
        }
      },

      'bower-install': {
        cmd: 'bower',
        args: [
          'install'
        ],
        options: {
          cwd: '.',
          stdio: 'inherit'
        },
        exit: function (next) {
          return function () {
            next();
          }
        }
      },

      'the-graph-npm-install': {
        cmd: 'npm',
        args: [
          'install'
        ],
        options: {
          cwd: 'bower_components/the-graph',
          stdio: 'inherit'
        },
        exit: function (next) {
          return function () {
            next();
          }
        }
      },

      'the-graph-bower-install': {
        cmd: 'bower',
        args: [
          'install'
        ],
        options: {
          cwd: 'bower_components/the-graph',
          stdio: 'inherit'
        },
        exit: function (next) {
          return function () {
            next();
          }
        }
      },

      'the-graph-grunt-build': {
        cmd: 'grunt',
        args: [
          'build'
        ],
        options: {
          cwd: 'bower_components/the-graph',
          stdio: 'inherit'
        },
        exit: function (next) {
          return function () {
            next();
          }
        }
      }

    },

    'loadNpmTasks': {
      'grunt-contrib-copy': {},
      'grunt-vulcanize': {},
      'grunt-mochaccino': {},
      'grunt-contrib-jshint': {},
      'web-component-tester': {},
      'grunt-http-server': {},
      'grunt-lint-inline': {},
      'grunt-contrib-uglify': {}
    }
  });

  grunt.registerMultiTask('loadNpmTasks', 'Loads tasks from specified npm module.', function () {
    grunt.loadNpmTasks(this.target);
  });

  grunt.registerMultiTask('build', 'Executes npm install, bower install, and then builds the-graph.', function () {
    var done = this.async();
    var self = this;

    var spawnCommand = function (index) {
      return function () {
        var child = spawn(self.data.cmd, self.data.args, self.data.options);
        child.on('exit', self.data.exit(done));
      };
    };

    spawnCommand(0)();
  });

  // wrappers for npm plugin tasks
  // they don't exist until after build:npm-install
  // for this reason - they can't be run directly
  grunt.registerTask('_jshint', ['jshint:all']);
  grunt.registerTask('_inlinelint', ['inlinelint:all']);
  grunt.registerTask('_copy', ['copy']);
  grunt.registerTask('_vulcanize', ['vulcanize']);
  grunt.registerTask('_http-server', ['http-server']);
  grunt.registerTask('_mochaccino-all', ['mochaccino:all']);
  grunt.registerTask('_wct-test-local', ['wct-test:local']);
  grunt.registerTask('_uglify', ['uglify']);

  // shortcuts - all require a separate build
  // nb cov doesn't need a shortcut because it's not an npm module
  grunt.registerTask('_lint', 'Runs lint on source code - run "grunt build" first.', ['loadNpmTasks:grunt-contrib-jshint', 'loadNpmTasks:grunt-lint-inline', '_jshint', '_inlinelint']);
  grunt.registerTask('_server', 'Run an http server - run "grunt build" first.', ['loadNpmTasks:grunt-http-server', '_http-server']);
  grunt.registerTask('_test', 'Runs all tests - run "grunt build" first.', ['_unit', '_wct-tests']);
  grunt.registerTask('_unit', 'Runs unit tests - run "grunt build" first.', ['loadNpmTasks:grunt-mochaccino', '_mochaccino-all']);
  grunt.registerTask('_wct-tests', 'Runs wct tests - run "grunt build" first.', ['loadNpmTasks:web-component-tester', '_wct-test-local']);
  grunt.registerTask('_dist', 'Build app into dist/ - run "grunt build" first.', ['_vulcanize', '_minify', '_copy:dist']);
  grunt.registerTask('_minify', 'Minify JavaScript source - run "grunt build" first.', ['loadNpmTasks:grunt-contrib-uglify', '_uglify']);

  // tasks for users - ensure build is correct before running tasks
  grunt.registerTask('vulcanize', 'Vulcanize app/index.html.', ['build:npm-install', '_vulcanize']);
  grunt.registerTask('lint', 'Run lint on source code.', ['build:npm-install', '_lint']);
  grunt.registerTask('dist', 'Build app into dist/', ['build', '_dist', '_minify']);
  grunt.registerTask('server', 'Run an http server.', ['build', '_http-server']);
  grunt.registerTask('unit', 'Runs unit tests.', ['build', '_unit']);
  grunt.registerTask('test', 'Run tests.', ['build', '_test']);
  grunt.registerTask('minify', 'Minify JavaScript source to dist/', ['build:npm-install', '_minify']);
  grunt.registerTask('default', 'Build, lint, and test.', ['build', '_lint', '_test']);

};

