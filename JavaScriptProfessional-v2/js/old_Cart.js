class Cart {
    constructor(source = 'responses/getCart.json', container = '.cart', containerShoppingCart = '#shopping-cart') {
        this.source = source;
        this.container = container;
        this.countGoods = 0; //Общее кол-во товаров в корзине
        this.amount = 0; //Общая стоимость товаров в корзине
        this.cartItems = []; //Массив со всеми товарами
        this.containerShoppingCart = containerShoppingCart;
        this._init();
    }

    _render() {
        let $totalGoods = $(`<a href="checkout.html"><img src="img/cart.svg" alt="cart"><div class="cart-circle-five sum-goods"></div></a>`);
        let $cartItemsDiv = $('<form/>', {
            class: 'cart-items-wrap cart-box'
        });
        let $totalPrice = $(`
      <div class="total"><p>TOTAL</p><p class="sum-price"></p></div>
      <button class="cart-button-checkout href-checkout">CHECKOUT</button>
      <button class="cart-button-go-to-cart href-go-to-cart">GO TO CART</button>
`);
        $totalGoods.appendTo($(this.container));
        $cartItemsDiv.appendTo($(this.container));
        $totalPrice.appendTo($cartItemsDiv);
        // //jQ-UI Отлавливаем перемещаемый элемент в корзину и отправляем в this.addProduct():
        // $(this.container).droppable({
        //   drop: (event, ui) => {
        //     this.addProduct(ui.draggable.find('.buyBtn'));
        //   }
        // });
    }

    _init() {
        this._render();
        if (!localStorage.getItem('mycart')) {     //добавляем localStorage
            fetch(this.source)
                .then(result => result.json())
                .then(data => {
                    for (let product of data.contents) {
                        this.cartItems.push(product);
                        this._renderItem(product);
                    }
                    this.countGoods = data.countGoods;
                    this.amount = data.amount;
                    localStorage.setItem('mycart', JSON.stringify(this.cartItems));
                    localStorage.setItem('amount', JSON.stringify(this.amount));
                    localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
                    this._renderSum();
                });
        } else {
            this.cartItems = JSON.parse(localStorage.getItem('mycart'));
            for (let product of this.cartItems) {
                this._renderItem(product)
            }
            this.amount = JSON.parse(localStorage.getItem('amount'));
            this.countGoods = JSON.parse(localStorage.getItem('countGoods'));
            this._renderSum();
        }

        this._renderShoppingCart();

        $('.href-checkout').click(event => {
            event.preventDefault();
            location.href = 'checkout.html';
        });
        $('.href-go-to-cart').click(event => {
            event.preventDefault();
            location.href = 'shopping-cart.html';
        });
    }

    _renderSum() {
        $('.sum-goods').text(`${this.countGoods}`);
        $('.sum-price').text(`${this.amount}$`);
    }

    _renderItem(product) {
        let $container = $('<div/>', {
            class: 'cart-item cart-flex',
            'data-product': product.id_product
        });
        let $reboxZane = $('<div/>', {
            class: 'rebox-zane',
        });
        let $removeElement = $(`<p><a class="icon-cancel-circled" href="#"></a></p>`);
        $reboxZane.append(`
      <p class="product-name">${product.product_name}</p>
      <p><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star-half-alt"></i></p>
      <p><span class="product-quantity">${product.quantity}</span><span> x </span><span>$${product.price}</span></p>
    `);
        $removeElement.appendTo($reboxZane);
        $container.append($(`
      <img class="cart-img" src="${product.img}" alt="${product.alt}">
`));
        $reboxZane.appendTo($container);
        $container.prependTo($('.cart-items-wrap'));
        this._remove(product, $removeElement, $container);
    }

    _updateCart(product) {
        let $container = $(`div[data-product="${product.id_product}"]`);
        $container.find('.product-quantity').text(product.quantity);
        $container.find('.product-price').text(`$${product.quantity * product.price}`);
    }

    addProduct(element) {
        let productId = +$(element).data('id');
        let find = this.cartItems.find(product => product.id_product === productId);
        if (find) {
            find.quantity++;
            this.countGoods++;
            this.amount += find.price;
            this._updateCart(find);
        } else {
            let product = {
                id_product: productId,
                img: $(element).data('img'),
                alt: $(element).data('alt'),
                price: +$(element).data('price'),
                product_name: $(element).data('name'),
                quantity: 1
            };
            this.cartItems.push(product);
            this.amount += product.price;
            this.countGoods++;
            this._renderItem(product);
        }
        localStorage.setItem('mycart', JSON.stringify(this.cartItems));  //Так же добавляем данные в localStorage
        localStorage.setItem('amount', JSON.stringify(this.amount));
        localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
        this._renderSum();
    }

    _remove(product, $removeElement, $container, $subtotal, $quantity) {
        $removeElement.click(event => {
            event.preventDefault();
            if (product.quantity > 0) {
                product.quantity--;
                this._updateCart(product);
                this.countGoods--;
                this.amount -= product.price;
                this._renderSum();

                if (!product.quantity) {
                    $container.remove();
                    this.cartItems.splice(this.cartItems.indexOf(product), 1) //так же удаление по индексу из массива
                }

                if ($subtotal) {
                    $subtotal.text(product.price * product.quantity);
                    $quantity.children().val(product.quantity);
                }
                localStorage.setItem('mycart', JSON.stringify(this.cartItems));
                localStorage.setItem('amount', JSON.stringify(this.amount));
                localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
            }
        })
    }

    _renderShoppingCart() {
        $(this.containerShoppingCart).append(`
      <div class="product-row">
          <div class="product-row-first"><p>PRODUCT DETAILS</p></div>
          <div class="product-row-other">
              <div><p>UNITE PRICE</p></div>
              <div><p>QUANTITY</p></div>
              <div><p>SHIPPING</p></div>
              <div><p>SUBTOTAL</p></div>
              <div><p>ACTION</p></div></div>
      </div>
    `);

        for (let product of this.cartItems) {
            let $container = $('<div/>', {
                class: 'product-row',
            });
            let $productRowFirst = (`
        <a href="product.html" class="product-row-first">
            <div><img class="shopping-cart-img" src="${product.img}" alt="${product.alt}"></div>
            <div>
                <div><p>${product.product_name}</p></div>
                <div><p><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star-half-alt"></i></p></div>
                <div><p>Color:</p><p>Red</p></div>
                <div><p>Size:</p><p>XII</p></div>
            </div>
        </a>
      `);
            let $productRowOther = $('<div/>', {
                class: 'product-row-other'
            });
            let $unitePrice = $(`<div><p>${product.price}</p></div>`);
            let $quantity = $(`<div><input type="number" value="${product.quantity}" min="1" max="999"></div>`);
            let $shipping = $(`<div><p>FREE</p></div>`);
            let $subtotal = $(`<div>${product.price * product.quantity}</div>`);
            let $action = $(`<div><p><a class="icon-cancel-circled" href="#"></a></p></div>`);

            $container.append($productRowFirst);
            $productRowOther.append($unitePrice);
            $productRowOther.append($quantity);
            $productRowOther.append($shipping);
            $productRowOther.append($subtotal);
            $productRowOther.append($action);
            $productRowOther.appendTo($container);
            $($container).appendTo(this.containerShoppingCart);

            this._remove(product, $action, $container, $subtotal, $quantity);
            this._quantity($quantity, product, $subtotal);
        }

        $(this.containerShoppingCart).append(`
      <div class="product-shopping-cart">
          <button class="clear-shopping-cart">CLEAR SHOPPING CART</button>
          <button class="href-checkout">CONTINUE SHOPPING</button>
      </div>
      <div class="product-shipping-total">
          <div>
              <p>SHIPPING ADRESS</p>
              <input id="product-shipping-adress" list="shipping-adress" placeholder="Bangladesh">
              <datalist id="shipping-adress">
                  <option label="Bangladesh" value="Bangladesh"></option>
                  <option label="France" value="France"></option>
                  <option label="Italia" value="Italia"></option>
                  <option label="South Korea" value="South Korea"></option>
                  <option label="USA" value="USA"></option>
                  <option label="Uzbekistan" value="Uzbekistan"></option>
                  <option label="Poland" value="Poland"></option>
                  <option label="China" value="China"></option>
                  <option label="Canada" value="Canada"></option>
              </datalist>
              <input type="text" placeholder="State">
              <input type="text" placeholder="Postcode/Zip">
              <button>GET A QUOTE</button>
          </div>
          <div>
              <p>COUPON DISCOUNT</p>
              <p>Enter your coupon code if you have one</p>
              <input type="text" placeholder="State">
              <button>APPLY COUPON</button>
          </div>
          <div>
              <p>SUB TOTAL</p><p class="sum-price">${this.amount}$</p>
              <p>GRAND TOTAL</p><p class="sum-price">${this.amount}$</p>
              <div></div>
             <button class="href-checkout">PROCEED TO CHECKOUT</button>
          </div>
      </div>
    `);
        $('.clear-shopping-cart').click(() => {
            $(this.containerShoppingCart).remove();
            $('.cart-items-wrap').remove();
            $('.sum-goods').text('0');
            localStorage.clear();
        });
    }

    _quantity($quantity, product, $subtotal) {
        $quantity.on('click', 'input', event, () => {
            this._quantityUpdate($quantity, product, $subtotal)
        });
        $quantity.keyup(event, () => {
            this._quantityUpdate($quantity, product, $subtotal)
        })
    }

    _quantityUpdate($quantity, product, $subtotal) {
        this.cartItems[this.cartItems.indexOf(product)].quantity = event.target.value;
        product.quantity = event.target.value;
        this.amount = 0;
        this.countGoods = 0;
        for (let item of this.cartItems) {
            this.amount += item.quantity * item.price;
            this.countGoods += +item.quantity;
        }
        $subtotal.text(product.price * product.quantity);
        this._updateCart(product);
        this._renderSum();

        localStorage.setItem('mycart', JSON.stringify(this.cartItems));  //Так же добавляем данные в localStorage
        localStorage.setItem('amount', JSON.stringify(this.amount));
        localStorage.setItem('countGoods', JSON.stringify(this.countGoods));
    }
}


