var gulp = require('gulp'),
    // yargs provides a key:value object for arguments instead of the native process.argv
    args = require('yargs').argv,
    config = require('./gulp.config')(),
    // del it is used to delete files and folders.
    del = require('del'),
    // Allows to to use conventional streams for gulp.
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    less = require('gulp-less'),
    // To load plugins when needed
    $ = require('gulp-load-plugins')({
        lazy: true
    });

// Compiles browserify modules.
gulp.task('browserify', function() {
    return browserify({
            // Sets the path where the main JS is.
            entries: [config.js + 'app.js']
        })
        // Creates the bundled JS.
        .bundle()
        // Converts the bundled JS into a gulp stream.
        .pipe(source('app.bundled.js'))
        // Saves the bundled JS into a directory.
        .pipe(gulp.dest(config.temp));
});

// Analizes JS files.
gulp.task('vetjs', ['browserify'], function() {
    log('Analyzing source with JSHint and JSCS');

    return gulp
        // Selects the source file to use.
        .src(config.temp + 'app.bundled.js')
        .pipe($.if(args.verbose, $.print()))
        // Executes jscs (code style linter/formatter).
        //.pipe($.jscs())
        // Executes jshint (tool to detect errors and potential problems in JavaScript code).
        .pipe($.jshint())
        // Logs errors using the stylish reporter.
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        // fail if JSHint was not a success.
        .pipe($.jshint.reporter('fail'));
});

// Compiles LESS files to CSS.
gulp.task('style', function() {
    log('Compiling Less --> CSS');

    return gulp
        // Selects the source file to use.
        .src(config.less)
        // Plumber prevents pipe breaking caused by errors from gulp plugins.
        .pipe($.plumber())
        // Compiles LESS files to CSS.
        .pipe(less())
        // Parses CSS and adds vendor prefixes to CSS rules.
        .pipe($.autoprefixer({
            browsers: ['last 2 version', '> 5%']
        }))
        // Saves the bundled JS into a directory.
        .pipe(gulp.dest(config.temp));
});

// Deletes compiled CSS files.
gulp.task('clean-styles', function(done) {
    clean(config.temp + '**/*.css', done);
});

// Watches for changes in LESS files.
gulp.task('less-watcher', function() {
    gulp.watch([config.allless], ['style']);
});

// Wires up CSS and JS into HTML.
gulp.task('wiredep', function() {
    log('Wire up css and js into the html');

    var wiredep = require('wiredep').stream;

    return gulp
        // Selects the HTML file to use.
        .src(config.index)
        // Injects the JS files into the HTML
        .pipe($.inject(gulp.src(config.temp + 'app.bundled.js')))
        // Saves the HTML file.
        .pipe(gulp.dest('./'));
});

gulp.task('inject', ['wiredep', 'style'], function() {
    log('Wire up the app css into the html, and call wiredep ');

    return gulp
        // Selects the HTML file to use.
        .src(config.index)
        // Injects the CSS files into the HTML
        .pipe($.inject(gulp.src(config.temp + 'style.css')))
        // Saves the HTML file.
        .pipe(gulp.dest('./'));
});

// Minifies CSS and JS
gulp.task('minify', ['inject'], function() {
    return gulp
        // Selects the HTML file to use.
        .src(config.index)
        // Plumber prevents pipe breaking caused by errors from gulp plugins.
        .pipe($.plumber())
        // Parses build blocks in the HTML.
        .pipe($.useref())
        // Filters CSS files and applies csso to minify CSS.
        .pipe($.if('**/*.css', $.csso()))
        // Filters JS files and applies uglify to minify JS.
        .pipe($.if('**/*.js', $.uglify()))
        // Saves minified files.
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
