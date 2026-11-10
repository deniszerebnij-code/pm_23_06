const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

function cleanTask(done) {
  require('node:fs').rmSync('dist', { recursive: true, force: true });
  done();
}

function htmlTask() {
  return src('src/app/index.html')
    .pipe(fileInclude({ basepath: 'src/app' }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function scssTask() {
  return src('src/scss/main.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(concat('index.min.css'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function jsTask() {
  return src('src/js/**/*.js', { allowEmpty: true })
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

function imagesTask() {
  return src('src/imgs/**/*', { encoding: false, allowEmpty: true })
    .pipe(imagemin([imagemin.gifsicle(), imagemin.optipng(), imagemin.svgo()]))
    .pipe(dest('dist/imgs'));
}

function bootstrapCssTask() {
  return src('node_modules/bootstrap/dist/css/bootstrap.min.css').pipe(dest('dist/css'));
}

function bootstrapJsTask() {
  return src('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js').pipe(dest('dist/js'));
}

function browserSyncServe(done) {
  browserSync.init({ server: { baseDir: './dist' }, port: 3000, notify: false }, done);
}

function watchTask() {
  watch('src/app/**/*.html', htmlTask);
  watch('src/scss/**/*.scss', scssTask);
  watch('src/js/**/*.js', jsTask);
  watch('src/imgs/**/*', imagesTask);
}

const buildTasks = parallel(htmlTask, scssTask, jsTask, imagesTask, parallel(bootstrapCssTask, bootstrapJsTask));
const build = series(cleanTask, buildTasks);
const serve = series(build, parallel(browserSyncServe, watchTask));

exports.clean = cleanTask;
exports.html = htmlTask;
exports.styles = scssTask;
exports.scripts = jsTask;
exports.images = imagesTask;
exports.bootstrapCss = bootstrapCssTask;
exports.bootstrapJs = bootstrapJsTask;
exports.build = build;
exports.default = serve;
