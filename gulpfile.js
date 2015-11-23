'use strict';

require('dotenv').load();

var _ = require('lodash'),
    path = require('path'),
    exec = require('child_process').exec,
    jsonfile = require('jsonfile'),
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    debug = require('gulp-debug'),
    plumber = require('gulp-plumber'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    del = require('del'),
    browserSync = require('browser-sync'),
    superstatic = require('superstatic'),
    mkdir = require('safe-mkdir').mkdirSync,
    KarmaServer = require('karma').Server,
    Q = require('q'),
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
            gulp.dest(outDir))
            .on('end', function() {
                deferred.resolve();
            })
            .on('error', function() {
                deferred.reject();
            });
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

gulp.task('mkservedir:www', function() {
    var deferred = Q.defer();

    del([serveDir]).then(function() {
        mkdir(serveDir);
        deferred.resolve();
    }, function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
});


gulp.task('config:www', ['mkservedir:www'], function() {
    var config = {};
    _.each(_.keys(process.env), function(key) {
        if (_.startsWith(key, 'UI_')) {
            config[key] = process.env[key];
        }
    });
    jsonfile.writeFileSync(serveDir + '/config.json', config);
});

gulp.task('compile:www', function () {
    var deferred = Q.defer();
    
    var codeSrc = [
        'src/core/**/*.ts',
        'src/ui/**/*.ts',
        'src/test/**/spec.ui.*.ts'
    ];
    
    lint(codeSrc).then(function() {
        compile({
            dir: 'www',
            module: 'amd',
            target: 'es5',
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
        'src/api/**/*.ts',
        'src/test/**/spec.api.*.ts'
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

gulp.task('test:api', ['compile:api'], function() {
    return gulp.src(outDirParent + '/api/test/**/*.js', {
        read: false
    }).pipe(mocha({
        reporter: 'spec'
    }));
});

gulp.task('test:www', ['compile:www'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('serve:api', ['compile:api'], function() {
    var deferred = Q.defer();

    exec('node ' + outDirParent + '/api/api/server.js', function (err, stdout, stderr) {
        if (err) {
            deferred.reject(err);
        } else {
            console.log(stdout);
            deferred.resolve();
        }
    });

    return deferred.promise;
});

gulp.task('copy:www', ['compile:www', 'mkservedir:www', 'config:www'], function() {
    var deferred = Q.defer();

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