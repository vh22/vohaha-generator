var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    path = require('path'),
    browserSync = require('browser-sync'),
    through2 = require('through2'),
    reload = browserSync.reload,
    browserify = require('browserify'),
    del = require('del'),
    argv = require('yargs').argv,
    copy = require('gulp-copy'),
    mainBowerFiles = require('main-bower-files'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    sourcemaps   = require('gulp-sourcemaps'),
    postcss   = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    compass = require('gulp-compass'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin');

// auto update browser page
gulp.task('browser-sync', function () {
    browserSync({
        open: !!argv.open,
        notify: !!argv.notify,
        server: {
            baseDir: "./dist"
        }
    });
});


// clear dist diretory
//gulp.task('clean', function (cb) {
//    return del('./dist', cb);
//});


// collect css
gulp.task('styles', function () {
    return gulp.src('./src/master/sass/**/*.{scss,sass}')
        .pipe(plumber())
        .pipe(compass({
            config_file: 'src/master/config.rb',
            css: 'src/assets/css',
            sass: 'src/master/sass'
        }))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(minifyCss())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/assets/css'));
});


// collect vendor css
gulp.task('vendor', function () {

    return gulp.src('./src/vendor/**/*.{map,min.map,min.css,min.js,eot,svg,ttf,woff,woff2,scss}')
        .pipe(plumber())
        .pipe(gulp.dest('./dist/vendor'));
});

// make browserify bundle
gulp.task('js', function () {
    return gulp.src('src/assets/js/*.js')
        .pipe(plumber())
        .pipe(through2.obj(function (file, enc, next) {
            browserify(file.path, {debug: true})
                .bundle(function (err, res) {
                    if (err) {
                        return next(err);
                    }
                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end')
        })
        .pipe(gulp.dest('./dist/assets/js'));
});


// minimize img
gulp.task('images', function () {
    return gulp.src('./src/assets/images/**/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            multipass: true,
            optimizationLevel: 4
        }))
        .pipe(gulp.dest('./dist/assets/images'))
});


// collect html pages
gulp.task('templates', function () {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest('dist/'))
});




gulp.task('build', ['styles', 'vendor', 'js', 'templates', 'images']);

gulp.task('serve', ['build', 'browser-sync'], function () {
    gulp.watch('src/master/sass/**/*', ['styles', reload]);
    gulp.watch('src/assets/js/**/*', ['js', reload]);
    gulp.watch('src/vendor/**/*', ['vendor', reload]);
    gulp.watch('src/assets/images/**/*', ['images', reload]);
    gulp.watch('src/*.html', ['templates', reload]);
});

gulp.task('default', ['serve']);
