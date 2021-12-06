$(document).ready(() => {

  //Корзина, shopping-cart, модули jQuery UI: автозаполнение в search, перетаскивание Drag and Drop
  let cart = new Cart('getCart.json');

  //Добавление товара
  $('.buyBtn').click(e => {
    cart.addProduct(e.currentTarget);
  });

  //Модуль отзывов
  let reviews = new Reviews('feedback.json');


  //Слайдер на single-page.
  if ($('.owl-carousel').length !== 0) {
    let owl = $(".owl-carousel");

    owl.owlCarousel({
      items: 1,
      loop: true,
      autoWidth: true,
      center: true,
      margin: 1500,
      autoplay: true,
      autoplaySpeed: 3000,
      smartSpeed: 3000,
    });

    $('.owl-next').click(event => {
      event.preventDefault();
      owl.trigger("next.owl.carousel");
    });
    $('.owl-prev').click(event => {
      event.preventDefault();
      owl.trigger("prev.owl.carousel");
    });
  }

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

  gulp.task('html', () => {
    return gulp.src('app/html/index.html') // Выбираем файлы
      .pipe(htmlMin({collapseWhitespace: true})) // 1 обработка: минифицируем файл
      .pipe(gulp.dest('dist')); // 2 обработка: сохраняем файл
  });
});