// Options
var options = {
  deploy: {
    target: 'root@static.kuru.cz:/srv/narra.wercajk.com',
    port: 50022
  }
}

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
    bower = require('gulp-bower'),
    bowerFiles = require("gulp-bower-files"),
    debug = require('gulp-debug'),
    exec = require('gulp-exec');



function generatePages(target) {
  return gulp.src(target)
    .pipe(jade().on('error', gutil.log))
    .pipe(livereload(server))
    .pipe(gulp.dest('.'));
}

function generateStyles(target) {
  return gulp.src(target)
    .pipe(stylus().on('error', gutil.log))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/styles'));
}

function generateScripts(target) {
  return gulp.src(target)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/scripts'));
}

function generateImages(target) {
  return gulp.src(target)
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })).on('error', gutil.log))
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/images'));
}


// Pages
gulp.task('pages', function() {
  return gulp.src('src/pages/*.jade')
    .on('data', function(file) {
        return generatePages(file.path);
    });
});

// Styles
gulp.task('styles', function() {
  gulp.src('src/styles/*.styl')
    .on('data', function(file) {
        return generateStyles(file.path);
    });
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.coffee')
    .on('data', function(file) {
        return generateScripts(file.path);
    });
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .on('data', function(file) {
        return generateImages(file.path);
    });
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
    .pipe(clean());
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('pages', 'styles', 'scripts', 'images', 'bower');
});


// Install bower and prepare lib folder
gulp.task('bower', function() {

  return bower()
    .pipe(gulp.dest('lib/'))
    .on('end', function(){
      gulp.start('lib-css', 'lib-js');
    });

});

// Compile all bower styles to lib.css
gulp.task('lib-css', function() {
    return gulp.src('lib/**/*.min.css')
      .pipe(minifycss())
      .pipe(concat('lib.css'))
      .pipe(gulp.dest('.'));
});

// Compile all bower scripts to lib.js
gulp.task('lib-js', function() {
    return gulp.src('lib/**/*.min.js')
      .pipe(uglify())
      .pipe(concat('lib.js'))
      .pipe(gulp.dest('.'));
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


// Deploy
gulp.task('deploy', ['pages'], function() {
  gulp.src('*')
    .pipe(exec('scp -i ~/.ssh/id_rsa -r -P <%=options.port%> <%=file.path%> <%= options.target %>', options.deploy))
});
