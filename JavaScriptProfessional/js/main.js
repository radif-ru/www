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
      smartSpeed: 500,
    });

    $('.owl-next').click(event => {
      event.preventDefault();
      owl.trigger("next.owl.carousel");
    });
    $('.owl-prev').click(event => {
      event.preventDefault();
      owl.trigger("prev.owl.carousel");
    });

    //не запускается почему-то
    $('.new-arrivals-price-range').slider({
      min: 0,
      max: 700,
      range: true,
      values: [52, 400],
    })

  }
});

