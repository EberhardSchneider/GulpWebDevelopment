var gulp = require('gulp'),
		sass = require('gulp-ruby-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		cleancss = require('gulp-clean-css'),
		rename = require('gulp-rename'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		lint = require('gulp-eslint'),
		imagemin = require('gulp-imagemin'),
		cache = require('gulp-cache'),
		browserify = require('browserify'),
		babelify = require('babelify'),
		reactify = require('reactify'),
		source = require('vinyl-source-stream'),
		buffer = require('vinyl-buffer'),
		sourcemaps = require('gulp-sourcemaps'),
		connect = require('gulp-connect'),
		open = require('gulp-open');

var config = {
	port: 3000, // port for the local server
	devBaseUrl: 'http://localhost',
	paths: {
		html: './src/*.html',
		js: './src/**/*.js',
		images: './src/images/*',
		css: './src/styles/**/*.scss',
		dist: './dist',
		mainJs: './src/main.js'
	}
}

// start local server
gulp.task('connect', function() {
	connect.server({
		root: ['dist'],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	});
});

gulp.task('open', ['connect'], function() {
	gulp.src('dist/index.html')
			.pipe(open('', {url: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('html', function() {
	gulp.src(config.paths.html)
			.pipe(gulp.dest(config.paths.dist))
			.pipe(connect.reload());
});

gulp.task('css', function() {
	sass(config.paths.css)
		.pipe(autoprefixer('last 2 version'))
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('dist/styles'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(cleancss())
		.pipe(gulp.dest(config.paths.dist + '/styles'))
		.pipe(connect.reload());;
});

gulp.task('js', function() {
	browserify(config.paths.mainJs) 
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest( config.paths.dist + '/scripts'))
		.pipe(connect.reload());
});

gulp.task('images', function() {
	return gulp.src('src/images/**/*')
					.pipe( cache( imagemin({ optimizationLevel: 5, progressive: true, interlaced: true}) ))
					.pipe( gulp.dest( 'dist/images/' ));
});

gulp.task('lint', function() {
	return gulp.src(config.paths.js)
							.pipe(lint({configFile: 'eslint.config.json'}))
							.pipe(lint.format());
});



gulp.task('watch', function() {
	gulp.watch(config.paths.html, ['html']);
	gulp.watch(config.paths.js, ['js', 'lint']);
	gulp.watch('src/styles/**/*.scss', ['css']);
	gulp.watch('src/images/**/*', ['images']);
});

gulp.task('default', ['html', 'js', 'css', 'images', 'lint', 'open', 'watch']);