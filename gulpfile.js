'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const minifyHtml = require('gulp-minify-html');
const webpack = require('webpack');
const gWebpack = require('webpack-stream');
const eslint = require('gulp-eslint');

const GLOBS = {
  src: 'src',
  dest: 'public',
};

gulp.task('lint', () => {
  return gulp.src([`${GLOBS.src}/**/*.js`])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('scripts', cb => {
  return webpack(require('./webpack.config.js')(), err => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    cb();
  });
});

gulp.task('html', function() {
    gulp.src(`${GLOBS.src}/index.html`)
        .pipe(minifyHtml({
            'empty': true
        }))
        .pipe(gulp.dest(GLOBS.dest));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(`${GLOBS.src}/**/*.js`, ['lint', 'scripts']);
    gulp.watch(`${GLOBS.src}/index.html`, ['html']);
});

// Build task
gulp.task('build', ['lint', 'scripts', 'html']);

// Default Task
gulp.task('default', ['build', 'watch']);
