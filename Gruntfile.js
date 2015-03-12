/* indent: 2 */
module.exports = function (grunt) {
  'use strict';

  var PATHS = {
    SRC: 'src/',
    DEST: 'dist/',

    ASSEMBLE: 'templates/',
    ASSETS: 'assets/',
    CONTENT: 'content/',
    CSS: 'assets/css/',
    DATA: '_data/',
    IMG: 'assets/img/',
    LOGIC: 'logic/',
    ROOT: 'root/',
    FONTS: 'assets/fonts/',
    JS: 'assets/js/',
    SASS: 'assets/sass/',
    TESTS: 'tests/',
    TMP: 'tmp/'
  };
  var PORT = 3000;

  var _ = require('lodash');
  var ngrok = require('ngrok');

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    // merge our default settings with the users' site settings
    siteData: _.merge(
      grunt.file.readJSON(PATHS.SRC + PATHS.LOGIC + PATHS.DATA + '/default.json'),
      grunt.file.readJSON(PATHS.SRC + PATHS.CONTENT + PATHS.DATA + '/site.json')),
    theme: 'themes/<%= siteData.settings.theme %>/',

    assemble: {
      // creates static pages
      // https://github.com/assemble/assemble
      options: {
        buildPaths: {
          dest: PATHS.DEST
        },
        collections: [{
          name: 'post'
        }, {
          name: 'nav'
        }],
        data: PATHS.SRC + PATHS.CONTENT + PATHS.DATA + '{,*/}*.json',
        helpers: PATHS.SRC + PATHS.LOGIC + 'helpers.js',
        siteData: '<%= siteData %>'
      },
      posts: {
        options: {
          layout: 'page.hbs', // default
          layoutdir: PATHS.SRC + '<%= theme %>' + PATHS.ASSEMBLE + 'layouts/',
          partials: PATHS.SRC + '<%= theme %>' + PATHS.ASSEMBLE + 'partials/{,*/}*.hbs'
        },
        files: [{
          cwd: PATHS.SRC + PATHS.CONTENT,
          dest: PATHS.DEST,
          expand: true,
          src: '**/*.hbs'
        }, {
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.ASSEMBLE + 'partials/',
          dest: PATHS.DEST,
          expand: true,
          src: 'search-json.hbs'
        }]
      }
    },

    autoprefixer: {
      // automatically add vendor prefixes to css
      // https://github.com/nDmitry/grunt-autoprefixer
      options: {
        browsers: ['last 2 version', '> 1%', 'ff esr', 'ie >= 8', 'ios >= 5', 'android >= 2.3'],
        map: true
      },
      site: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.CSS,
          dest: PATHS.DEST + PATHS.CSS,
          expand: true,
          ext: '.css',
          src: '**/*.css'
        }]
      },
      content: {
        files: [{
          cwd: PATHS.SRC + PATHS.CONTENT,
          dest: PATHS.DEST + PATHS.CONTENT,
          expand: true,
          ext: '.css',
          src: '**/*.css'
        }]
      }
    },

    buildcontrol: {
      options: {
        dir: PATHS.DEST,
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: '<%= siteData.git.repo %>',
          branch: '<%= siteData.git.branch %>'
        }
      },
      local: {
        options: {
          remote: '../',
          branch: '<%= siteData.git.branch %>'
        }
      }
    },

    clean: {
      // cleans out files from the specified folders
      // https://github.com/gruntjs/grunt-contrib-clean
      css: PATHS.SRC + '<%= theme %>' + PATHS.CSS,
      dist: PATHS.DEST,
      useminTidy: [PATHS.DEST + PATHS.JS + '*', '!' + PATHS.DEST + PATHS.JS + '**/*.min{,.*}.js', '!' + PATHS.DEST + PATHS.JS + 'vendors/*.js']
    },

    cmq: {
      // combine media queries to avoid duplicates
      // https://github.com/buildingblocks/grunt-combine-media-queries
      site: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.CSS,
          dest: PATHS.DEST + PATHS.CSS,
          expand: true,
          ext: '.css',
          src: '**/*.css'
        }]
      }
    },

    connect: {
      // create a local server
      // https://github.com/gruntjs/grunt-contrib-connect
      options: {
        base: './dist', //PATHS.DEST,
        hostname: 'localhost',
        port: PORT
      },
      dev: {
      },
      content: {
        options: {
          open: true
        }
      }
    },

    copy: {
      // copy files
      // https://github.com/gruntjs/grunt-contrib-copy
      content: {
        files: [{
          cwd: PATHS.SRC + PATHS.CONTENT,
          dest: PATHS.DEST,
          expand: true,
          src: '**/*.{css,js}'
        }]
      },
      contentImage: {
        files: [{
          cwd: PATHS.SRC + PATHS.CONTENT,
          dest: PATHS.DEST,
          expand: true,
          src: 'img/*.{gif,jpg,png,svg}'
        }]
      },
      fonts: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.FONTS,
          dest: PATHS.DEST + PATHS.FONTS,
          expand: true,
          src: '{,*/}*.*'
        }]
      },
      image: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.IMG,
          dest: PATHS.DEST + PATHS.IMG,
          expand: true,
          src: '**/*.{gif,jpg,png,svg}'
        }]
      },
      modernizr: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.JS,
          dest: PATHS.DEST + PATHS.JS,
          expand: true,
          src: ['vendors/modernizr.js']
        }]
      },
      root: {
        files: [{
          cwd: PATHS.SRC + PATHS.ROOT,
          dest: PATHS.DEST,
          expand: true,
          src: '*.*'
        }]
      },
      rootTheme: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.ROOT,
          dest: PATHS.DEST,
          expand: true,
          src: '*.*'
        }]
      },
      scripts: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.JS,
          dest: PATHS.DEST + PATHS.JS,
          expand: true,
          src: ['**/*.js', '!vendors/*.js']
        }]
      },
      vendorScripts: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.JS,
          dest: PATHS.DEST + PATHS.JS,
          expand: true,
          src: ['vendors/**/*.js', '!vendors/modernizr*.js']
        }]
      }
    },

    criticalcss: {
      prod: {
        options: {
          url: 'localhost:' + PORT,
          width: 1440,
          height: 1000,
          filename: PATHS.CSS,
          outputfile: 'tmp/dist.css'
        }
      }
    },

    filerev: {
      // add a file revision number to cached assets
      // https://github.com/yeoman/grunt-filerev
      dist: {
        src: [
          PATHS.DEST + PATHS.CSS + '**/*.css',
          //PATHS.DEST + PATHS.IMG + '**/*.{gif,jpg,png,svg}',
          PATHS.DEST + PATHS.JS + '**/*.js',
          '!' + PATHS.DEST + PATHS.JS + 'vendors/*.js'
        ]
      }
    },

    htmlmin: {
      // minify HTML
      // https://github.com/gruntjs/grunt-contrib-htmlmin
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          cwd: PATHS.DEST,
          dest: PATHS.DEST,
          expand: true,
          src: '**/*.html'
        }]
      }
    },

    imagemin: {
      // minify images
      // https://github.com/gruntjs/grunt-contrib-imagemin
      options: {
        optimizationLevel: 7
      },
      site: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.IMG,
          dest: PATHS.DEST + PATHS.IMG,
          expand: true,
          src: '**/*.{gif,jpg,png,svg}'
        }]
      },
      content: {
        files: [{
          cwd: PATHS.SRC + PATHS.CONTENT,
          dest: PATHS.DEST,
          expand: true,
          src: '**/*.{gif,jpg,png,svg}'
        }]
      }
    },

    jasmine: {
      // run unit tests against javascript
      // https://github.com/gruntjs/grunt-contrib-jasmine
      dev: {
        src: PATHS.SRC + PATHS.LOGIC + '{,*/}helper-posts.js',
        options: {
          helpers: ['./node_modules/assemble/node_modules/assemble-handlebars/node_modules/handlebars/dist/handlebars.js', PATHS.SRC + PATHS.TESTS + 'helpers/{,*/}*.js'],
          specs: PATHS.SRC + PATHS.TESTS + 'specs/{,*/}*.js',
          template: require('grunt-template-jasmine-requirejs')
        }
      }
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec',
      },
      all: [PATHS.SRC + PATHS.TESTS]
    },

    jshint: {
      // make sure we are writing good javascript!
      // https://github.com/gruntjs/grunt-contrib-jshint
      options: {
        force: true,
        jshintrc: PATHS.SRC + '.jshintrc',
        reporter: require('jshint-stylish')
      },
      site: {
        files: [{
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.JS,
          expand: true,
          src: ['**/*.js', '!vendors/**/*.js', '!modernizr.js']
        }]
      },
      assemble: {
        files: [{
          cwd: PATHS.SRC + PATHS.LOGIC,
          expand: true,
          src: '{,*/}*.js'
        }]
      },
      grunt: {
        src: 'Gruntfile.js'
      }
    },

    jsonlint: {
      // lint our JSON files
      // https://github.com/brandonramirez/grunt-jsonlint
      search: {
        src: [
          PATHS.DEST + 'search.json'
        ]
      },
      site: {
        src: [
          PATHS.SRC + PATHS.CONTENT + PATHS.DATA + '{,*/}*.json',
          PATHS.SRC + PATHS.LOGIC + PATHS.DATA + '{,*/}*.json'
        ]
      }
    },

    karma: {
      options: {
        browsers: ['Chrome'],
        singleRun: false
      },
      unit: {
        configFile : 'config/karma.conf.js'
      }
    },

    modernizr: {
      // output customised modernizr
      site: {
        devFile: PATHS.SRC + '<%= theme %>' + PATHS.JS + 'vendors/modernizr.js',
        files: {
          src: [PATHS.SRC + '<%= theme %>**/*', '!' + PATHS.SRC + '<%= theme %>**/modernizr.js']
        },
        outputFile: PATHS.DEST + PATHS.JS + 'vendors/modernizr.custom.min.js',
        parseFiles: false
      }
    },

    pagespeed: {
      options: {
        locale: "en_GB",
        nokey: true,
        threshold: 80,
        url: "http://localhost:" + PORT
      },
      desktop: {
        options: {
          strategy: "desktop"
        }
      },
      mobile: {
        options: {
          strategy: "mobile"
        }
      }
    },

    rename: {
      // assemble won't allow us to use 'ext' to change from HTML to JSON
      search: {
        src: PATHS.DEST + 'search-json.html',
        dest: PATHS.DEST + 'search.json'
      }
    },

    sass: {
      // create css from our sass files (js sass compiler)
      // https://github.com/sindresorhus/grunt-sass
      options: {
        sourceMap: true
      },
      site: {
        options: {
          outputStyle: 'compressed'
        },
        files: [{
          expand: true,
          src: ['**/*.scss', '!**/_*.scss'],
          cwd: PATHS.SRC + '<%= theme %>' + PATHS.SASS,
          dest: PATHS.SRC + '<%= theme %>' + PATHS.CSS,
          ext: '.css'
        }]
      }
    },

    usemin: {
      // minify, concatenate files and change paths
      // (auto configures uglify, cssmin and concat)
      // https://github.com/yeoman/grunt-usemin
      options: {
        assetsDirs: [
          PATHS.DEST
        ]
      },
      html: PATHS.DEST + '**/*.html'
    },

    useminPrepare: {
      // prep for usemin
      // https://github.com/yeoman/grunt-usemin
      html: PATHS.DEST + 'index.html',
      options: {
        root: PATHS.DEST
      }
    },

    watch: {
      // watch for changes and run tasks
      // https://github.com/gruntjs/grunt-contrib-watch
      options: {
        livereload: true
      },
      assemble: {
        expand: true,
        files: [PATHS.SRC + '<%= theme %>' + PATHS.ASSEMBLE + '**/*.hbs', PATHS.SRC + PATHS.CONTENT + '**/*.hbs'],
        tasks: ['newer:assemble', 'rename', 'jsonlint:search']
      },
      assembleHelpers: {
        expand: true,
        files: [PATHS.SRC + PATHS.LOGIC + '{,*/}*.js'],
        tasks: ['newer:jshint:assemble', 'newer:assemble']
      },
      contentCss: {
        expand: true,
        files: PATHS.SRC + PATHS.CONTENT + '**/*.css',
        tasks: 'newer:copy:contentCss'
      },
      contentImage: {
        expand: true,
        files: PATHS.SRC + PATHS.CONTENT + '**/*.{gif,jpg,png,svg}',
        tasks: 'newer:copy:contentImage'
      },
      fonts: {
        expand: true,
        files: PATHS.SRC + '<%= theme %>' + PATHS.FONTS + '{,*/}*.*',
        tasks: 'newer:copy:fonts'
      },
      images: {
        expand: true,
        files: PATHS.SRC + '<%= theme %>' + PATHS.IMG + '{,*/}*.{gif,jpg,png,svg}',
        tasks: 'newer:copy:image'
      },
      json: {
        expand: true,
        files: PATHS.SRC + PATHS.CONTENT + PATHS.DATA + '{,*/}*.json',
        tasks: 'newer:assemble'
      },
      sass: {
        expand: true,
        files: PATHS.SRC + '<%= theme %>' + PATHS.SASS + '**/*.scss',
        tasks: 'styles'
      },
      scripts: {
        expand: true,
        files: PATHS.SRC + '<%= theme %>' + PATHS.JS + '**/*.js',
        tasks: 'scripts'
      }
    },

    concurrent: {
      build: ['stream1', 'stream2']
    }

  });

  require('jit-grunt')(grunt, {
    buildcontrol: 'grunt-build-control',
    sass: 'libsass',
    useminPrepare: 'grunt-usemin'
  });

  grunt.registerTask('psi-ngrok', 'Run pagespeed with ngrok', function () {
    var done = this.async();

    ngrok.connect(PORT, function (err, url) {
      if (err !== null) {
        grunt.fail.fatal(err);
        return done();
      }
      grunt.config.set('pagespeed.options.url', url);
      grunt.task.run('pagespeed');
      done();
    });
  });

  grunt.registerTask('root', ['copy:root', 'copy:rootTheme']);
  grunt.registerTask('fonts', ['copy:fonts']);
  grunt.registerTask('images', ['copy:image']);

  grunt.registerTask('styles', ['sass', 'autoprefixer:site']);
  grunt.registerTask('scripts', ['jshint', 'copy:scripts', 'copy:vendorScripts', 'modernizr']);

  grunt.registerTask('content', ['jsonlint:site', 'assemble', 'autoprefixer:content', 'copy:contentImage', 'copy:content', 'rename', 'jsonlint:search']);

  // concurrent streams
  grunt.registerTask('stream1', ['styles', 'fonts', 'root', 'images', 'scripts']);
  grunt.registerTask('stream2', ['content']);

  // build tasks
  grunt.registerTask('build', ['clean:dist', 'concurrent:build']);

  // compression step including usemin
  // 'filerev' is currently commented out due to a problem with multiple directories
  grunt.registerTask('compress', ['useminPrepare', 'concat', 'cssmin', 'uglify', 'usemin', 'clean:useminTidy', 'copy:vendorScripts', 'modernizr', 'htmlmin']);

  grunt.registerTask('run', ['connect:dev', 'watch']);
  grunt.registerTask('runContent', ['connect:content', 'watch']);


  // TASKS TO BE RUN AT THE COMMAND LINE

  // default task for content authors
  grunt.registerTask('default', ['build', 'run']);

  // task for developers
  grunt.registerTask('open', ['build', 'runContent']);

  // task for build server
  grunt.registerTask('production', ['build', 'compress']);
  grunt.registerTask('prod', 'production');

  // task for deployment to gh-pages
  grunt.registerTask('deploy', ['prod', 'buildcontrol']);

};
