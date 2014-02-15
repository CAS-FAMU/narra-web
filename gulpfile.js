// Load plugins
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    coffee = require('gulp-coffee'),
    jade = require('gulp-jade'),
    gutil = require('gulp-util'),
    http = require('http'),
    ecstatic = require('ecstatic'),
    bowerFiles = require("gulp-bower-files");


// Pages
gulp.task('pages', function() {
  return gulp.src('src/pages/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('.'));
});

// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
    .pipe(clean());
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('pages', 'styles', 'scripts', 'images');
});

gulp.task('bower', function() {
  bowerFiles()
    .pipe(gulp.dest("./lib"));
});

// Watch
gulp.task('watch', function() {

  gulp.start(['bower']);

  console.log('Listening on http://0.0.0.0:8080');
  http.createServer(
    ecstatic({ root: __dirname + '/' })
  ).listen(8080);

  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };

    // Watch .jade files
    gulp.watch('src/pages/**/*.jade', ['pages']);

    // Watch .styl files
    gulp.watch('src/styles/**/*.styl', ['styles']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.coffee', ['scripts']);

    // Watch image files
    gulp.watch('src/images/**/*', ['images']);

  });

});
