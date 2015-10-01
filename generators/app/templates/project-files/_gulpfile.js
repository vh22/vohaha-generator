var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    path = require('path'),
    compress = require('compression'),
    browserSync = require('browser-sync').create(),
    through2 = require('through2'),
    reload = browserSync.reload,
    browserify = require('browserify'),
    argv = require('yargs').argv,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    compass = require('gulp-compass'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    minifyHTML = require('gulp-minify-html'),
    cssshrink = require('gulp-cssshrink'),
    svgmin = require('gulp-svgmin'),
    uncss = require('gulp-uncss'),
    gzip = require('gulp-gzip'),
    middleware = require('connect-gzip-static'),
    del = require('del'),
    jade = require('gulp-jade'),
    fs = require('fs'),
    critical = require('critical').stream;

//====================================
//
//          build tasks
//
//====================================

gulp.task('jade', function () {
    fs.stat('.src/*.jade', function (err, stat) {
        if (err == null) {
            return gulp.task('doJade', function () {
                var YOUR_LOCALS = {};

                gulp.src('./src/template/*.jade')
                    .pipe(jade({
                        locals: YOUR_LOCALS
                    }))
                    .pipe(gulp.dest('./src'))
            });
        } else {
            console.log('jade files not found');
        }
    });
});

// collect html pages
gulp.task('html', ['jade'], function () {
    return gulp.src('src/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('./dist'))
});

// collect the main stylesheet
gulp.task('styles', ['existingCss'], function () {
    return gulp.src('./src/master/sass/**/*.{scss,sass}')
        .pipe(plumber())
        .pipe(compass({
            config_file: 'src/master/config.rb',
            css: './src/assets/css',
            sass: './src/master/sass'
        }))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/assets/css'))
});

gulp.task('existingCss', function () {
    return gulp.src('./src/assets/css/existing/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('./dist/assets/css'))
});

// main vendor task
gulp.task('vendor', ['vendorStyles', 'vendorJs']);

// concat vendor styles
gulp.task('vendorStyles', function () {
    return gulp.src('src/vendor/**/*.css')
        .pipe(concat('vendor.css'))
        .pipe(minifyCss())
        //.pipe(cssshrink())
        .pipe(gulp.dest('./dist/vendor/css'));
});

// concat vendor js
gulp.task('vendorJs', function () {
    return gulp.src('src/vendor/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist/vendor/js'));
});

// collect js files via browserify
gulp.task('js', function () {
    return gulp.src('src/assets/js/**/*.js')
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

// collect fonts
gulp.task('fonts', function () {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('./dist/assets/fonts'))
});

//gulp.task('existingFonts', function () {
//    return gulp.src('./src/assets/fonts/existing/**/*')
//        .pipe(plumber())
//        .pipe(gulp.dest('./dist/font'))
//});

// collect images
gulp.task('img', function () {
    return gulp.src('src/assets/images/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('./dist/assets/images'))
});

//gulp.task('existingImg', function () {
//    return gulp.src('./src/assets/images/existing/**/*')
//        .pipe(plumber())
//        .pipe(gulp.dest('./dist/img'))
//});


//====================================
//
//          optimization tasks
//
//====================================


// optimize html
gulp.task('htmlMin', function () {
    var opts = {
        conditionals: true
    };

    return gulp.src('dist/**/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// optimize stylesheet
gulp.task('stylesMin', function () {
    return gulp.src('dist/assets/css/*.css')
        .pipe(minifyCss())
        .pipe(cssshrink())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// optimize js
gulp.task('jsMin', function () {
    return gulp.src('dist/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// optimize images
gulp.task('imgMin', function () {
    return gulp.src('dist/assets/images/**/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            multipass: true,
            optimizationLevel: 4
        }))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// optimize svg
gulp.task('svgMin', function () {
    return gulp.src('dist/assets/images/**/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// main vendor optimize task
gulp.task('vendorMin', ['vendorStylesMin', 'vendorJsMin']);

// optimize vendor stylesheet
gulp.task('vendorStylesMin', function () {
    return gulp.src('dist/vendor/css/vendor.css')
        .pipe(minifyCss())
        .pipe(cssshrink())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// optimize vendor js
gulp.task('vendorJsMin', function () {
    return gulp.src('dist/vendor/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

// add critical css path
gulp.task('critical', function () {
    return gulp.src('dist/*.html')
        .pipe(critical({
            base: 'dist/',
            css: ['dist/assets/css/style.css'],
            inline: true,
            minify: true,
            width: 100,
            height: 100
        }))
        .pipe(gulp.dest('dist'));
});

//====================================
//
//          main tasks
//
//====================================

// build
gulp.task('build', ['html', 'styles', 'vendor', 'js', 'fonts', 'img']);

// optimize
gulp.task('optimize', ['htmlMin', 'stylesMin', 'jsMin', 'svgMin', 'vendorMin']);

gulp.task('optimizeImg', ['imgMin']);

// serve
gulp.task('serve', ['browser-sync'], function () {
    gulp.watch('src/master/sass/**/*', ['styles', reload]);
    gulp.watch('src/assets/css/existing/**/*', ['styles', reload]);
    gulp.watch('src/assets/fonts/**/*', ['fonts', reload]);
    gulp.watch('src/assets/js/**/*', ['js', reload]);
    gulp.watch('src/vendor/**/*', ['vendor', reload]);
    gulp.watch('src/assets/images/**/*', ['img', reload]);
    gulp.watch('src/*.html', ['html', browserSync.reload]);
});

// start server
gulp.task('browser-sync', ['build'], function () {
    browserSync.init({
        open: !!argv.open,
        notify: !!argv.notify,
        server: {
            baseDir: "dist"
        }
    });
});

gulp.task('default', ['serve']);
