'use strict'

const babel = require('gulp-babel')
const browserify = require('gulp-browserify')
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')
const sass = require('gulp-sass')
const wait = require('gulp-wait')
const watch = require('gulp-watch')
const reloadDelay = 500

gulp.task('lint', () => {
  return gulp.src(['src/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
});

gulp.task('js', ['lint'], () => {
  return gulp.src('src/index.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : true
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./build'))
    .pipe(wait(reloadDelay))
    .pipe(livereload())
});

gulp.task('scss', () => {
  return gulp.src(['./src/*.scss'])
    .pipe(sass({
      loadPath: ['./src/**']
    }).on('error', sass.logError))
    .pipe(gulp.dest('./build'))
    .pipe(wait(reloadDelay))
    .pipe(livereload())
})

gulp.task('server', () => {
  return nodemon({
    script: 'server.js',
    ext: 'html scss js'
  })
})

gulp.task('watch', () => {
  livereload({ start: true })
  return gulp.watch(['src/**'], ['build'])
})

gulp.task('build', ['js', 'scss'])
gulp.task('default', ['server', 'build', 'watch'])
