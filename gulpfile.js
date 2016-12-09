const gulp = require('gulp')
const sass = require('gulp-sass')
const ejs = require("gulp-ejs")
const sourcemaps = require('gulp-sourcemaps')
const livereload = require('gulp-livereload')
const usemin = require('gulp-usemin')
const babel = require('gulp-babel')
const	path = {
	src:'/src',
	dist:'/dist'
}

// task groups /////////////////////////////////////////////////////////////////
gulp.task('default', ['ejs', 'sass', 'watch'])
// compile tasks ///////////////////////////////////////////////////////////////
gulp.task('sass', ()=>{
  return gulp.src('.'+path.src+'/*.scss')
		.pipe(sourcemaps.init())
    .pipe(sass({outputStyle:'compressed'}).on('error', sass.logError))
		.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'+path.dist+'/app'))
		.pipe(livereload())
})
gulp.task('babel', ()=>{
  return gulp.src('.'+path.src+'/app.js')
		.pipe(babel({presets:['es2015', 'react']}))
    .pipe(gulp.dest('.'+path.dist+'/app'))
})
gulp.task('ejs', ()=>{
  return gulp.src(['.'+path.src+'/*.ejs', '!.'+path.src+'/_*'])
    .pipe(ejs({}, {ext:'.html'}))
    .pipe(gulp.dest('.'+path.dist+'/'))
})
gulp.task('usemin', ['sass'], ()=>{
  return gulp.src(['.'+path.src+'/_head_usemin.ejs'])
    .pipe(ejs({}, {ext:'.html'}))
		.pipe(usemin({
      css: [],
      js: []
    }))
    .pipe(gulp.dest('.'+path.dist+'/'))
})
// watch ///////////////////////////////////////////////////////////////////////
gulp.task('watch', ()=>{
	livereload.listen(35729)
	gulp.watch(['.'+path.src+'/*.js'], ['babel'])
	gulp.watch(['.'+path.src+'/*.ejs'], ['ejs'])
	gulp.watch('.'+path.src+'/*.scss', ['sass'])
	gulp.watch('.'+path.dist+'/**', function(file) {
	   livereload.changed(file.path)
	});
})
