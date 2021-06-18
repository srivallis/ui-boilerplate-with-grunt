module.exports = function (grunt) {
  const sass = require('node-sass');
  require('load-grunt-tasks')(grunt);
  const path = require('path');
  const srcPath = path.join(__dirname, 'src/views');
  const destPath = path.join(__dirname, 'public/views');
  const port = grunt.option('port') || '2345';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
        implementation: sass,
        sourceMap: false
      },
      build: {
        files: [{
          expand: true,
          cwd: 'src/assets/sass/',
          src: ['**/*.scss', '!**/_*.scss'],
          dest: 'public/assets/css/',
          ext: '.css'
        }]
      }
    },
    cssmin: {
      build: {
        files: [{
          expand: true,
          cwd: 'public/',
          src: ['**/*.css', '!**/*.min.css'],
          dest: 'public/',
          ext: '.min.css'
        }]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')
        ]
      },
      build: {
        files: [{
          expand: true,
          cwd: 'public/assets/css/',
          src: ['**/theme.css'],
          dest: 'public/assets/css/',
          ext: '.css'
        }]
      }
    },
    sasslint: {
      options: {
        configFile: './.sass-lint.yml'
      },
      target: ['src/assets/sass/**/*.scss', '!src/assets/sass/vendor/**']
    },
    eslint: {
      target: ['src/assets/js/*.js', 'gruntfile.js']
    },
    clean: {
      build: ['public/']
    },
    browserify: {
      build: {
        options: {
          transform: [
            ['babelify', { presets: ['@babel/preset-env'] }]
          ],
          browserifyOptions: { debug: true }
        },
        files: [{
          expand: true,
          cwd: 'src/assets/js/',
          src: '*.js',
          dest: 'public/assets/js/',
          ext: '.js'
        }]
      }
    },
    uglify: {
      options: {
        compress: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'public/assets/js/',
          src: '*.js',
          dest: 'public/assets/js/',
          ext: '.min.js'
        }]
      }
    },
    nunjucks: {
      options: {
        data: grunt.file.readJSON('data.json'),
        paths: srcPath
      },
      render: {
        files: [{
          expand: true,
          cwd: srcPath,
          src: '**/!(_*).njk',
          rename: function (dest, src) {
            // This is done to achieve folder flattening
            // leaving a single root subfolder for all the inner pages. Eg: public/views/atoms/button.html
            // Instead of public/views/atoms/button/button.html
            const filePathArray = src.split('/');
            if (filePathArray.length > 1) {
              return `${dest}/${filePathArray[0]}/${filePathArray[filePathArray.length - 1]}`;
            } else {
              return `${dest}/${src}`;
            }
          },
          dest: destPath,
          ext: '.html'
        }]
      }
    },
    connect: {
      server: {
        options: {
          useAvailablePort: true,
          port: port,
          open: true,
          livereload: {
            include: [/.*/]
          },
          // public/ --> for serving assets like css & js
          // public/views/ --> exclusively for htmls
          base: ['public/', 'public/views/']
        }
      }
    },
    watch: {
      css: {
        expand: true,
        files: 'src/assets/sass/**/*.scss',
        tasks: ['sasslint', 'sass'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['src/assets/js/**/*.js', 'gruntfile.js'],
        tasks: ['eslint', 'browserify', 'uglify'],
        options: {
          spawn: false,
          failOnError: true,
          livereload: true
        }
      },
      html: {
        files: ['src/**/*.html', 'src/**/*.njk'],
        tasks: ['nunjucks'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    }
  });

  grunt.registerTask('build:dev', [
    'clean',
    'sasslint',
    'eslint',
    'browserify',
    'uglify',
    'sass',
    'cssmin',
    'postcss',
    'nunjucks',
    'connect',
    'watch'
  ]);
  grunt.registerTask('build:prod', [
    'clean',
    'sasslint',
    'eslint',
    'browserify',
    'uglify',
    'sass',
    'cssmin',
    'postcss',
    'nunjucks'
  ]);
};
