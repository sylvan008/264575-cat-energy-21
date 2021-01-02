const gulp = require("gulp");
const del = require('del');
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const gulpWebp = require('gulp-webp');
const rename = require("gulp-rename");
const svgstore = require("gulp-svgstore");
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');

const BUILD_PATH = 'build';

// Clean

const clean = () => {
  return del(BUILD_PATH);
}

// HTML

const html = () => {
  return gulp.src('source/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(`${BUILD_PATH}`))
}

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso(),
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(`${BUILD_PATH}/css`))
    .pipe(sync.stream());
}

exports.styles = styles;

//  Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest(`${BUILD_PATH}/js`))
    .pipe(sync.stream())
}

exports.scripts = scripts;

// Images

const images = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(`${BUILD_PATH}/img`))
    .pipe(sync.stream());
}

exports.images = images;

// Webp

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulpWebp({ quality: 80 }))
    .pipe(gulp.dest(`${BUILD_PATH}/img`))
}

exports.createWebp = createWebp;

// SVG sprite

const sprite = () => {
  return gulp.src('source/img/svg/common/*.svg')
    .pipe(svgstore())
    .pipe(rename('sprite_common.svg'))
    .pipe(gulp.dest(`${BUILD_PATH}/img/svg/`))
}

exports.sprite = sprite;

// Copy

const copy = (isDev = false) => {
  const sources = [
    'source/fonts/**/*.{woff2,woff}',
  ];

  if (isDev) {
    sources.push('source/img/**/*.{jpg,png,svg}');
  }

  return gulp.src(sources, {
    base: 'source'
  })
    .pipe(gulp.dest(`${BUILD_PATH}`));
}

exports.copy = copy;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

// Build

const build = gulp.series(
  clean,
  gulp.parallel(
    copy,
    html,
    styles,
    images,
    createWebp,
    sprite,
    scripts,
  )
);

exports.build = build;

exports.default = gulp.series(
  clean,
  gulp.series(
    () => copy(true),
    html,
    styles,
    createWebp,
    sprite,
    scripts,
  ),
  gulp.series(
    server,
    watcher,
  )
);
