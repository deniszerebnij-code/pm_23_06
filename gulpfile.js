const { src, dest, watch, series, parallel } = require('gulp');
const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

function htmlTask() {
    return src('src/*.html')
        .pipe(fileinclude())
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

function scssTask() {
    return src('src/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

function jsTask() {
    return src('src/js/main.js')
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

function imagesTask() {
    return src('src/imgs/**/*', { encoding: false })
        .pipe(imagemin())
        .pipe(dest('dist/imgs'));
}

function bootstrapCss() {
    return src('node_modules/bootstrap/dist/css/bootstrap.min.css')
        .pipe(dest('dist/css'));
}

function bootstrapJs() {
    return src('node_modules/bootstrap/dist/js/bootstrap.min.js')
        .pipe(dest('dist/js'));
}

function browserSyncServe() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 3000,
        notify: false
    });
}

function watchTask() {
    watch('src/**/*.html', htmlTask);
    watch('src/scss/**/*.scss', scssTask);
    watch('src/js/**/*.js', jsTask);
    watch('src/imgs/**/*', imagesTask);
}

const bootstrap = parallel(bootstrapCss, bootstrapJs);
const build = parallel(htmlTask, scssTask, jsTask, imagesTask, bootstrap);
const serve = parallel(browserSyncServe, watchTask);

exports.bootstrap = bootstrap;
exports.default = series(build, serve);