var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
  gulp.src('client/scss/stylesheet.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('client/css/'));
});

gulp.task('default', ['styles']);
