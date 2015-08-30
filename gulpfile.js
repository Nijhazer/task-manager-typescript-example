'use strict';

var path = require('path'),
    gulp = require('gulp'),
    debug = require('gulp-debug'),
    plumber = require('gulp-plumber'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'), 
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    browserSync = require('browser-sync'),
    superstatic = require('superstatic'),
    mkdir = require('safe-mkdir').mkdirSync,
    KarmaServer = require('karma').Server,
    Q = require('q'),
    defineModule = require('gulp-define-module'),
    _handlebars = require('handlebars'),
    handlebars = require('gulp-handlebars');

var outDirParent = 'generated',
    serveDir = 'serve';

var getProjectConfig = function(overrides) {
    return tsc.createProject('tsconfig.json', overrides);
};

var compile = function(params) {
    var deferred = Q.defer();
    
    var outDir = outDirParent + "/" + params.dir;
    
    del([outDir]).then(function() {
        mkdir(outDirParent);
        mkdir(outDir);
        
        var projectConfig = getProjectConfig({
            "module": params.module,
            "outDir": outDir
        });
        
        var tsResult =
            gulp.src(params.input)
            .pipe(tsc(projectConfig));
    
        tsResult.js.pipe(
            gulp.dest(outDir));
            
        deferred.resolve();
    });
    
    return deferred.promise;
};

var lint = function(input) {
    var deferred = Q.defer();
    
    gulp.src(input)
        .pipe(plumber())
        .pipe(tslint())
        .pipe(tslint.report('prose'))
        .on('error', function(error) {
            deferred.reject(error);
        })
        .on('end', function() {
            deferred.resolve();
        });
        
    return deferred.promise;
};

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile:www', function () {
    var deferred = Q.defer();
    
    var codeSrc = [
        'src/core/**/*.ts',
        'src/ui/**/*.ts',
        'src/test/**/*.ts'
    ];
    
    lint(codeSrc).then(function() {
        compile({
            dir: 'www',
            module: 'amd',
            input: ['tools/**'].concat(codeSrc)
        }).then(function() {
            deferred.resolve();
        });
    }, function(error) {
        deferred.reject(error);
    });
    
    return deferred.promise;
});

gulp.task('compile:api', [], function() {
    var deferred = Q.defer();
    
    var codeSrc = [
        'src/core/**/*.ts',
        'src/api/**/*.ts'
    ];
    
    lint(codeSrc).then(function() {
        compile({
            dir: 'api',
            module: 'commonjs',
            target: 'es6',
            input: ['tools/**'].concat(codeSrc)
        }).then(function() {
            deferred.resolve();
        });
    }, function(error) {
        deferred.reject(error);
    });
    
    return deferred.promise;
});

gulp.task('copy:www', ['compile:www'], function() {
    var deferred = Q.defer();

    del([serveDir]).then(function(paths) {
        mkdir(serveDir);

        gulp.src('./src/www/**')
            .pipe(gulp.dest('./' + serveDir))
            .on('end', function() {
                gulp.src('./' + outDirParent + '/www/{core,ui}/**')
                    .pipe(gulp.dest('./' + serveDir + '/js/lib'))
                    .on('error', function(error) {
                        deferred.reject(error);
                    })
                    .on('end', function() {
                        deferred.resolve();
                    });
            });
    });

    return deferred.promise;
});

gulp.task('watch:www', ['copy:www'], browserSync.reload);

gulp.task('serve:www', ['copy:www'], function () {
    browserSync({
        port: 3000,
        files: ['index.html', 'css/**', 'js/**/*.js'],
        server: {
            baseDir: './' + serveDir,
            middleware: superstatic({ debug: false })
        }
    });

    gulp.watch(
        [
            'src/core/**/*.ts',
            'src/ui/**/*.ts',
            'src/www/views/**/*.hbs'
        ],
        ['watch:www']
    );
});

gulp.task('default', []);