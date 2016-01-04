var gulp = require('gulp'),
    // yargs provides a key:value object for arguments instead of the native process.argv
    args = require('yargs').argv,
    config = require('./gulp.config')(),
    del = require('del'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    less = require('gulp-less'),
    // To load plugins when needed
    $ = require('gulp-load-plugins')({
        lazy: true
    });

gulp.task('browserify', function() {
    return browserify({
            entries: [config.js + 'app.js']
        })
        .bundle()
        .pipe(source('app.bundled.js'))
        .pipe(gulp.dest(config.temp));
});

gulp.task('vetjs', ['browserify'], function() {
    log('Analyzing source with JSHint and JSCS');

    return gulp
        .src(config.temp + 'app.bundled.js')
        .pipe($.if(args.verbose, $.print()))
        //.pipe($.jscs())
        .pipe($.jshint())
        // Styles JSHint output
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('style', function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        // Plumber prevents pipe breaking caused by errors from gulp plugins
        .pipe($.plumber())
        .pipe(less())
        .pipe($.autoprefixer({
            browsers: ['last 2 version', '> 5%']
        }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done) {
    clean(config.temp + '**/*.css', done);
});

gulp.task('less-watcher', function() {
    gulp.watch([config.allless], ['style']);
});

gulp.task('wiredep', function() {
    log('Wire up css and js into the html');
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.temp + 'app.bundled.js')))
        .pipe(gulp.dest('./'));
});

gulp.task('inject', ['wiredep', 'style'], function() {
    log('Wire up the app css into the html, and call wiredep ');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.temp + 'style.css')))
        .pipe(gulp.dest('./'));
});

gulp.task('minify', ['inject'], function() {
    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.useref())
        .pipe($.if('**/*.css', $.csso()))
        .pipe($.if('**/*.js', $.uglify()))
        .pipe(gulp.dest('./src/build'));
});

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
