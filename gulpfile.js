// Initialise dependencies
var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var yaml = require('gulp-yaml');

// CSS task
gulp.task('sass', function() {
    gulp.src('scss/main.scss')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('css'))
});

// Yaml to JSON task
gulp.task('yaml', function() {
   gulp.src('data/*.yml')
       .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
       .pipe(yaml({ space: 2 }))
       .pipe(gulp.dest('data'))
});

gulp.task('watch', function () {
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('data/*.yml', ['yaml']);
});

