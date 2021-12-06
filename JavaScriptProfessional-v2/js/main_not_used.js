// const goods = {
//     price: 100,
//     name: 'T-short',
//     size: 'L',
//     color: 'red'
// };

class Goods {
    constructor(id, name, price, img_src, img_alt, quantity = 10) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img_src = img_src;
        this.img_alt = img_alt;

        this.quantity = quantity;
        this.element = undefined;
    }

    buy(count = 1) {
        this.quantity -= count;
    }

    getHtml() {
        return `
       <div class="parent-product">
            <a class="product" href="shopping-cart.html">
                <img src="${this.img_src}" alt="${this.img_alt}">
                <p class="description-product">${this.name}</p>
                <p class="price">$${this.price}.00</p>
            </a>
            <div class="product-link-flex">
                <a class="add-to-cart buyBtn" href="#">
                    <img src="img/cart-white.svg" alt="cart-white">
                    Add to Cart
                </a>
            </div>
        </div>
       `;
    }

    render() {
        const item = document.createElement('div');
        item.classList.add('parent-product');

        const a_prod = document.createElement('a');
        a_prod.classList.add('product');
        a_prod.href = 'shopping-cart.html';
        item.appendChild(a_prod);

        const img = document.createElement('img');
        img.src = `${this.img_src}`;
        img.alt = `${this.img_alt}`;
        a_prod.appendChild(img);

        const p_description = document.createElement('p');
        p_description.classList.add('description-product');
        p_description.innerText = `${this.name}`;
        a_prod.appendChild(p_description);

        const p_price = document.createElement('p');
        p_price.classList.add('price');
        p_price.innerText = `$${this.price}.00`;
        a_prod.appendChild(p_price);


        const div_prod_link = document.createElement('div');
        div_prod_link.classList.add('product-link-flex');
        item.appendChild(div_prod_link)

        const a_add = document.createElement('a');
        a_add.classList.add('add-to-cart', 'buyBtn');
        a_add.href = '#';
        div_prod_link.appendChild(a_add);

        const img_add = document.createElement('img');
        img_add.src = 'img/cart-white.svg';
        img_add.alt = 'cart-white';
        a_add.appendChild(img_add);

        a_add.insertAdjacentText('beforeend', 'Add to Cart');

        this.element = item;

        return this.element;
    }
}

class Clothes extends Goods {
    constructor(id, name, price, img_src, img_alt, quantity, color, size = 'M') {
        super(id, name, price, img_src, img_alt, quantity);

        this.color = color;
        this.size = size;
    }
}

class GoodsList {
    constructor(
        product_box = document.getElementById('product-box'),
        products_href = "https://raw.githubusercontent.com/radif-ru/JavaScriptProfessional-v2/master/responses/catalogData.json"
    ) {
        this.product_box = product_box;
        this.products_href = products_href;
        this.goods_arr = [];
        this.filter_goods = [];
    }

    fetchFunc = (err_counter = 5) => {
        fetch(
            this.products_href,
            {
                method: 'GET',
                headers: {},
                // body: ''
            }
        ).then(res => {
            console.log('fetch', res);
            // throw new Error('For test');
            return res.json();
        }).then(res => {
            console.log('json res', res);
            for (let i of res) {
                const item = new Goods(i.id, i.product_name, i.price,
                    i.img_src, i.img_alt, i.quantity);
                this.product_box.appendChild(item.render());
                this.goods_arr.push(item);
            }
        }).catch(error => {
            if (err_counter > 0) {
                setTimeout(
                    () => {
                        console.log('catch error!', error);
                        this.fetchFunc(err_counter -= 1);
                    },
                    3000
                );
            }
        });
    };

    filterGoods(value) {
        const regexp = new RegExp(value, 'gmi');
        this.filter_goods = this.goods_arr.filter(good => regexp.test(good.name));
        console.log(`filter_goods ${this.filter_goods}`);
        console.log(`goods_arr ${this.goods_arr}`);
    }
}

goods_list = new GoodsList()
goods_list.fetchFunc()
goods_list.filterGoods('MANGO');

class Cart {
    constructor() {
    }

    addItem() {
        /*
         Этот метод добавляет переданный товар в корзину
        */
    }

    /**
     * Удалят товар из корзины
     * @param id int - идентификатор товара
     * @return bool - успешность удаления
     */
    removeItem(id) {
        // TODO
        throw new Error('Need remove code');
    }
}

/**
 * Функция подсчета суммы товаров
 * @param goods Goods[] - массив товаров
 * @return float - сумма всех переданных товаров
 */
function goodsSum(goods) {
    // Считаем сумму товаров
    // И возвращаем
}

// [...document.getElementsByClassName('class-name')].forEach();
// (new Array(...document.getElementsByClassName('class-name'))).forEach();
