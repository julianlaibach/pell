const babel = require('rollup-plugin-babel')
const cssnano = require('gulp-cssnano')
const gulp = require('gulp')
const rename = require('gulp-rename')
const rollup = require('gulp-rollup')
const sass = require('gulp-sass')(require('sass'));
const size = require('gulp-size')

const rollupConfig = minimize => ({
  input: './src/pell.js',
  output: {
    name: 'pell',
    format: 'umd',
    exports: 'named',
  },
  plugins: [babel({ exclude: 'node_modules/**' })].concat(
    minimize
      ? []
      : []
  )
})

gulp.task('script', (done) => {
  gulp.src('./src/*.js')
    .pipe(rollup(rollupConfig(false)))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest('./dist'))

  gulp.src('./src/*.js')
    .pipe(rollup(rollupConfig(true)))
    .pipe(rename('pell.min.js'))
    .pipe(size({ showFiles: true }))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(gulp.dest('./dist'))

  done()
})

gulp.task('style', (done) => {
  gulp.src(['./src/pell.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
    .pipe(cssnano())
    .pipe(rename('pell.min.css'))
    .pipe(gulp.dest('./dist'))
  
  done()
})

gulp.task('watch', function (done) {
  gulp.watch('./src/pell.scss', gulp.series('sass'));
  gulp.watch('./src/pell.js', gulp.series('js'));
})

gulp.task('default', gulp.series('style', 'script'));