let gulp = require('gulp'), //Подключаем сам gulp
  sass = require('gulp-sass'), // Компиляция sass в css
  uglifyJs = require('gulp-uglifyes'), // Минификация js
  autoPrefixer = require('gulp-autoprefixer'), // Вендорные префиксы
  concat = require('gulp-concat'), // Конкатенация файлов
  bs = require('browser-sync'), // Server
  htmlMin = require('gulp-htmlmin'), // Минификация html
  rename = require('gulp-rename'), // Rename
  delFiles = require('del'), // Delete files
  cssMinify = require('gulp-csso'), // Css minify
  babel = require('gulp-babel'), // Babel
  pug = require('gulp-pug'); // Pug

// Методы
// gulp.task() - создание новой задачи
// gulp.src() - получение файлов
// gulp.dest() - сохранение файлов
// gulp.series() - запуск задач по порядку (по порядку аргументов)
// gulp.parallel() - запуск задач параллельно
// gulp.watch() - следит за файлами

gulp.task('test', () => {
  return console.log('Gulp works!');
});

gulp.task('html', () => {
  return gulp.src('app/html/index.html', 'app/html/checkout.html', 'app/html/product.html', 'app/html/shopping-cart.html', 'app/html/single-page.html') // Выбираем файлы
    .pipe(htmlMin({collapseWhitespace: true})) // 1 обработка: минифицируем файл
    .pipe(gulp.dest('dist')); // 2 обработка: сохраняем файл
});

gulp.task('pug', () => {
  // return gulp.src(['app/pug/*.pug', 'app/templates/*.pug'])
  return gulp.src('app/pug/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist/templates'))
});
gulp.task('clear', () => {
  return delFiles(['dist/**', 'dist/**/*.*', '!dist']) //удалит все файлы и все папки (кроме папки dist)
});
gulp.task('sass', () => {
  // return gulp.src('app/sass/**/*.+(scss|sass)');      //return gulp.src('app/sass/**/*.scss')
  // return gulp.src('app/img/**/*.+(jpg|png|gif|svg)');
  return gulp.src('app/sass/**/*.sass')
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(cssMinify())
    .pipe(gulp.dest('dist/css'))
});
gulp.task('js:es6', () => {
  return gulp.src('app/js/**/*.js')
    .pipe(uglifyJs())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/js'))
});
gulp.task('babel', () => {
  return gulp.src('app/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename({
      suffix: '.es5'
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('server', () => {
  return bs({
    browser: 'chrome',
    server: {
      baseDir: 'dist'
    }
  })
});

gulp.task('sass:watch', () => {
  return gulp.watch('app/sass/**/*.sass', gulp.series('sass', (done) => {
    bs.reload();
    done();
  }))
});
gulp.task('js:watch', () => {
  return gulp.watch('app/js/**/*.js', gulp.series('js:es6', (done) => {
    bs.reload();
    done();
  }))
});

gulp.task('default', gulp.series('clear', gulp.parallel('html', 'pug', 'sass', 'js:es6', 'babel'), gulp.parallel('sass:watch', 'server')));