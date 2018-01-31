// Initialise dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");

// CSS task
gulp.task('sass', function() {
    gulp.src('scss/main.scss')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('css'))
});

gulp.task('watch', function () {
    gulp.watch('scss/main.scss', ['sass']);
});

