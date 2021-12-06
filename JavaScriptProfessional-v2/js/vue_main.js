const vm = Vue.createApp({
    el: '#root',
    data() {
        return {
            products_href: 'https://raw.githubusercontent.com/radif-ru/JavaScriptProfessional-v2/master/responses/catalogData.json',
            goods: [],
            // filtered_goods: [],
            // upd_obs: false,
        }
    },
    computed: {},
    methods: {
        getData(products_href, err_counter = 5) {
            fetch(
                products_href,
                {
                    method: 'GET',
                    headers: {},
                    // body: ''
                }
            ).then(res => res.json()
            ).then(res => {
                this.goods = res;
                // this.filtered_goods = res;
            }).catch(error => {
                if (err_counter > 1) {
                    setTimeout(
                        () => {
                            console.log('catch error!', error);
                            this.getData(products_href, err_counter -= 1);
                        },
                        3000
                    );
                }
            });
            return this.goods
        },
        filteredGoods(value) {
            const regexp = new RegExp(value, 'gmi');
            this.filtered_goods = this.getData(this.products_href, 5).filter(product => regexp.test(product.name));
            // console.log(`filtered_goods ${this.filtered_goods}`); //Пустые значения. Почему?
            // console.log(`goods ${this.goods}`); //Пустые значения. Почему?
        }
    },
    mounted() {
        this.getData(this.products_href, 5);
        this.filteredGoods('MANGO');
        //Изначально Vue подключался удалённо, пришлось заморочиться
        //чтобы код из old_main_js() подгружался после загрузки DOM из Vue,
        //теперь подключил Vue локально, можно обёртки из this.$nextTick
        //и setTimeout удалить и код продолжит отрабатывать корректно
        this.$nextTick(() => {
            setTimeout(() => {
                old_main_js();
            }, 300)
        });
    },
    // updated() {
    //     // Сработает 1 раз. Для избежания повторных загрузок
    //     if (!this.upd_obs) {
    //         old_main_js();
    //         this.upd_obs = true;
    //     }
    // }
});

console.log(vm);

vm.component('header-main', {
    template: `
   <header class="header">
        <div class="container header-flex">
            <div class="header-left">
                <a class="logo" href="index.html"><img src="img/logo.png"
                                                       alt="logo">BRAN
                    <div class="pink-letter">D</div>
                </a>
                <form class="header-form" action="javascript://">
                    <details class="browse">
                        <summary class="browse-summary">Browse</summary>
                        <ul class="browse-text">
                            <li><p>WOMEN</p></li>
                            <li><a href="single-page.html">Dresses</a></li>
                            <li><a href="single-page.html">Tops</a></li>
                            <li>
                                <a href="single-page.html">Sweaters/Knits</a>
                            </li>
                            <li>
                                <a href="single-page.html">Jackets/Coats</a>
                            </li>
                            <li><a href="single-page.html">Blazers</a></li>
                            <li><a href="single-page.html">Denim</a></li>
                            <li>
                                <a href="single-page.html">Leggings/Pants</a>
                            </li>
                            <li>
                                <a href="single-page.html">Skirts/Shorts</a>
                            </li>
                            <li><a href="single-page.html">Accessories</a>
                            </li>
                            <li><p>MEN</p></li>
                            <li><a href="product.html">Teens/Tank tops</a>
                            </li>
                            <li><a href="product.html">Shirts/Polos</a>
                            </li>
                            <li><a href="product.html">Sweaters</a></li>
                            <li>
                                <a href="product.html">Sweatshirts/Hoodies</a>
                            </li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Jackets/vests</a>
                            </li>
                        </ul>
                    </details>
                    <input class="search" type="search"
                           placeholder="Search for item..."
                           title="It is acceptable to enter only English letters"
                           pattern="[A-Za-z]+" autofocus>
                    <button class="button-form" type="submit"><img
                            src="img/search.png" alt="search"></button>
                </form>
            </div>
            <div class="header-right">
                <div class="cart">
<!--                    Генерация из js-->
                </div>
                <a class="button" href="javascript://">My Account <img
                        src="img/down-arrov.png" alt="down-arrov"></a>
            </div>
        </div>
    </header>
    <slot></slot>
    `
});

vm.component('navigation', {
    template: `
    <nav class="container">
        <ul class="menu">
            <li><a href="index.html">Home</a></li>
            <li><a href="product.html">Man</a>
                <div class="mega-box">
                    <div class="mega-flex">
                        <div class="mega-heading">Man</div>
                        <ul>
                            <li><a class="mega-link" href="product.html">Teens/Tank
                                tops</a></li>
                            <li><a class="mega-link" href="product.html">Shirts/Polos</a>
                            </li>
                            <li><a class="mega-link" href="product.html">Sweaters</a>
                            </li>
                            <li><a class="mega-link" href="product.html">Sweatshirts/Hoodies</a>
                            </li>
                            <li><a class="mega-link" href="product.html">Jackets/vests</a>
                            </li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <div>
                            <div class="mega-heading">Man</div>
                            <ul>
                                <li><a class="mega-link" href="javascript://">Teens/Tank
                                    tops</a></li>
                            </ul>
                        </div>
                        <div>
                            <div class="mega-heading">Man</div>
                            <ul>
                                <li><a class="mega-link"
                                       href="product.html">Teens/Tank
                                    tops</a></li>
                                <li><a class="mega-link"
                                       href="product.html">Shirts/Polos</a>
                                </li>
                                <li><a class="mega-link"
                                       href="product.html">Sweaters</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </li>
            <li><a href="single-page.html">Women</a>
                <div class="mega-box">
                    <div class="mega-flex">
                        <div class="mega-heading">Wonen</div>
                        <ul>
                            <li><a class="mega-link"
                                   href="single-page.html">Dresses</a></li>
                            <li><a class="mega-link"
                                   href="single-page.html">Tops</a></li>
                            <li><a class="mega-link"
                                   href="single-page.html">Sweaters/Knits</a>
                            </li>
                            <li><a class="mega-link"
                                   href="single-page.html">Jackets/Coats</a>
                            </li>
                            <li><a class="mega-link"
                                   href="single-page.html">Blazers</a></li>
                            <li><a class="mega-link"
                                   href="single-page.html">Denim</a></li>
                            <li><a class="mega-link"
                                   href="single-page.html">Leggings/Pants</a>
                            </li>
                            <li><a class="mega-link"
                                   href="single-page.html">Skirts/Shorts</a>
                            </li>
                            <li><a class="mega-link"
                                   href="single-page.html">Accessories</a>
                            </li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <div>
                            <div class="mega-heading">Wonen</div>
                            <ul>
                                <li><a class="mega-link"
                                       href="single-page.html">Dresses</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Tops</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Sweaters/Knits</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Jackets/Coats</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div class="mega-heading">Wonen</div>
                            <ul>
                                <li><a class="mega-link"
                                       href="single-page.html">Dresses</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Tops</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Sweaters/Knits</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="mega-flex">
                        <div>
                            <div class="mega-heading">Wonen</div>
                            <ul>
                                <li><a class="mega-link"
                                       href="single-page.html">Dresses</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Tops</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Sweaters/Knits</a>
                                </li>
                                <li><a class="mega-link"
                                       href="single-page.html">Jackets/Coats</a>
                                </li>
                            </ul>
                        </div>
                        <div class="mega-img">
                            <img src="img/mega-img.jpg" alt="mega-img">
                            <div>
                                <p>SUPER</p>
                                <p>SALE!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            <li><a href="javascript://">Kids</a>
                <div class="mega-box">
                    <div class="mega-flex">
                        <div class="mega-heading">Kids</div>
                        <ul>
                            <li><a class="mega-link" href="javascript://">...</a></li>
                            <li><a class="mega-link" href="javascript://">...</a></li>
                            <li><a class="mega-link" href="javascript://">...</a></li>
                            <li><a class="mega-link" href="javascript://">...</a></li>
                            <li><a class="mega-link" href="javascript://">...</a></li>
                        </ul>
                    </div>
                </div>
            </li>
            <li><a href="javascript://">Accoseriese</a></li>
            <li><a href="javascript://">Featured</a></li>
            <li><a href="javascript://">Hot Deals</a></li>
            <li><a href="burger-shop.html" target="_blank">Burger shop</a>
            </li>
        </ul>
    </nav>
    `
});

vm.component('goods-list', {
    // props: ['goods'],
    props: {
        goods: {
            type: Array,
            required: false,
            default: () => [] // () => ({})
        }
    },
    data() {
        return {
            products: this.goods // Не работает. Почему?
        };
    },
    template: `<div class="parent-product" v-for="(prod, id) in goods"
                     :key="\`prod_\${id}\`">
                    <a class="product" href="javascript://">
                        <img :src="prod.img_src" :alt="prod.img_alt">
                        <p class="description-product">
                            {{ prod.product_name }}</p>
                        <p class="price">\${{ prod.price }}.00</p>
                    </a>
                    <div class="product-link-flex">
                        <a class="add-to-cart buyBtn" href="javascript://" 
                        :data-id="prod.id_product" 
                        :data-price="prod.price" 
                        :data-name="prod.product_name" 
                        :data-img="prod.img_src" 
                        :data-alt="prod.img_alt">
                            <img src="img/cart-white.svg" alt="cart-white">
                            Add to Cart
                        </a>
                    </div>
                </div>`,
});

vm.component('subscribe-box', {
    template: `
    <div class="subscribe-box">
        <div class="subscribe-background"></div>
        <div class="subscribe-flex container">
            <div class="subscribe">
                <div class="subscribe-left">
                    <div>
                        <img src="img/bin-burhan.png" alt="bin-burhan">
                    </div>
                    <div>
                        <p>“Vestibulum quis porttitor dui! Quisque viverra
                            nunc mi, a pulvinar purus condimentum a.
                            Aliquam condimentum mattis neque sed
                            pretium”</p>
                        <p>Bin Burhan</p>
                        <p>Dhaka, Bd</p>
                        <div class="subscribe-left-line">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div class="subscribe-right">
                    <div class="subcribe-right-box">
                        <p>Subscribe</p>
                        <p>FOR OUR NEWLETTER AND PROMOTION</p>
                        <form action="#">
                            <fieldset class="email-button">
                                <input id="email" type="email"
                                       placeholder="Enter Your Email"
                                       pattern="([A-z0-9_.-]{1,})@([A-z0-9_.-]{1,}).([A-z]{2,8})"
                                       size="30" required
                                       title="Pleace enter valid email address">
                                <button>Subscribe</button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
});

vm.component('container-brand', {
    template: `
    <div class="container brand">
        <div>
            <a class="logo" href="index.html"><img src="img/logo.png"
                                                   alt="logo">BRAN
                <div class="pink-letter">D</div>
            </a>
            <div class="brand-info">
                <p>Objectively transition extensive data rather than cross
                    functional solutions. Monotonectally syndicate
                    multidisciplinary materials before go forward benefits.
                    Intrinsicly syndicate an expanded array of processes
                    and cross-unit partnerships.</p>
                <p>Efficiently plagiarize 24/365 action items and focused
                    infomediaries.
                    Distinctively seize superior initiatives for wireless
                    technologies. Dynamically optimize.</p>
            </div>
        </div>
        <div class="brand-menu">
            <p>COMPANY</p>
            <a href="index.html">Home</a>
            <a href="#">Shop</a>
            <a href="#">About</a>
            <a href="#">How It Works</a>
            <a href="#">Contact</a>
        </div>
        <div class="brand-menu">
            <p>INFORMATION</p>
            <a href="#">Tearms & Condition</a>
            <a href="#">Privacy Policy</a>
            <a href="#">How to Buy</a>
            <a href="#">How to Sell</a>
            <a href="#">Promotion</a>
        </div>
        <div class="brand-menu">
            <p>SHOP CATEGORY</p>
            <a href="product.html">Men</a>
            <a href="single-page.html">Women</a>
            <a href="#">Child</a>
            <a href="#">Apparel</a>
            <a href="#">Brows All</a>
        </div>
    </div>
    `
});

vm.component('footer-wrap', {
    template: `
    <footer class="footer-wrap">
        <div class="container footer">
            <div>© 2018 Brand All Rights Reserved.</div>
            <div class="social">
                <a href="http://facebook.com/TheBrand" target="_blank">
                    <img src="img/facebook.png" alt="facebook">
                </a>
                <a href="https://twitter.com/TheBrand" target="_blank">
                    <img src="img/twitter.png" alt="twitter">
                </a>
                <a href="https://linkedin.com/TheBrand" target="_blank">
                    <img src="img/linkedin.png" alt="linkedin">
                </a>
                <a href="http://pinterest.ru/TheBrand" target="_blank">
                    <img src="img/pinterest.png" alt="pinterest">
                </a>
                <a href="https://plus.google.com/TheBrand" target="_blank">
                    <img src="img/google+.png" alt="google+">
                </a>
            </div>
        </div>
    </footer>
    `
}).mount('#root');
