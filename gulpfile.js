var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var rsync = require('gulp-rsync');
var clean = require('gulp-clean');
var webpack = require('webpack');
var gulpsync = require('gulp-sync')(gulp);
var uglify = require('gulp-uglify');
var RevAll = require('gulp-rev-all');

var copy = require('./src/copy/copy.js');
var webpackConfig = require('./webpack.config.js');

var handleBarsOptions = {
    ignorePartials: true, //ignores unknown partials
    batch : ['./src/templates/partials'], // where partials can be loaded from
    helpers : {
      capitals : function(){
        return v1.toUpperCase();
      },
      ifCond: function(v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
      ifOdd: function(int, options) {
        return int % 2 !== 0 ? options.fn(this) : options.inverse(this);
      },
      inc: function(value, options){
        return parseInt(value) + 1;
      }
    }
};

gulp.task('templates', function () {
  return gulp.src('src/templates/**/*.hbs')
      .pipe(handlebars(copy, handleBarsOptions))
      .pipe(rename(function(path) {
        path.extname = '.html';
      }))
      .pipe(gulp.dest('public'));
});

gulp.task('sass', function () {
  return gulp.src('./src/sass/global.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('styles.css'))
    .pipe(gulp.dest('./public/assets'))
    .pipe(browserSync.stream());
});

gulp.task('sass-prod', function () {
  return gulp.src('./src/sass/global.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename('styles.css'))
    .pipe(gulp.dest('./tmp/assets'));
});

gulp.task('javascript', function(){
  return webpack(webpackConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
  });
});

gulp.task('serve', ['copy-images', 'copy-css', 'sass', 'javascript', 'templates'], function() {
  browserSync.init({
    ghostMode: false,
    server: {
      baseDir: './public'
    }
  });
  gulp.watch('./src/sass/**/*.scss', ['sass']);

  gulp.watch([
    './src/templates/**/*.hbs'
  ], [
    'templates',
    browserSync.reload
  ]);

  gulp.watch('./src/js/**/*.js', ['javascript']);
  gulp.watch('./public/assets/app.js', browserSync.reload);
});


gulp.task('lint', function() {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
  return gulp.src(['./dist', './tmp'], {
    read: false})
    .pipe(clean({
      force: true
    }));
});

gulp.task('clean-partials', function () {
  return gulp.src('./tmp/partials', {
    read: false})
    .pipe(clean({
      force: true
    }));
});

gulp.task('copy-images', function(){
  gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./public/assets/images'));
  gulp.src('./src/favicon/**/*')
    .pipe(gulp.dest('./public/favicon'));
});

gulp.task('copy-css', function(){
  gulp.src('./src/css/*')
    .pipe(gulp.dest('./public/assets/'));
	gulp.src('./src/css/*')
    .pipe(gulp.dest('./tmp/assets/'));
});

gulp.task('copy-files', function(){
  gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./tmp/assets/images'));
});

gulp.task('htaccess', function() {
  gulp.src('./src/.htaccess')
    .pipe(gulp.dest('./dist'));
})

gulp.task('default', ['serve']);

gulp.task('rev', function() {
  var revAll = new RevAll({
    dontRenameFile: [/^\/favicon.ico$/g, 'robots.txt', '.html', '.xml', '.htaccess'],
    dontUpdateReference: [/^\/favicon.ico$/g, 'robots.txt', '.html', '.xml', '.htaccess']
  });
  gulp.src('./tmp/**')
    .pipe(revAll.revision())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', gulpsync.sync([
  'clean',
  'copy-files',
  'copy-css',
  'javascript-prod',
  'sass-prod',
  'templates',
  'clean-partials'
]));