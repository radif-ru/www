// const goods = {
//     price: 100,
//     name: 'T-short',
//     size: 'L',
//     color: 'red'
// };

class Goods {
    constructor(price, name) {
        this.price = price;
        this.name = name;
        // this.color = color;
        // this.size = size;

        this.store = 10;
        this.element = undefined;
    }

    buy(count = 1){
        this.store -= count;
    }

   getHtml(){
       return `<div class="item">
            <img class="item__photo" src="img/item6.png" alt="item6">
            <div class="item-hover"></div>
            <div class="item__info">
                <p class="item__info_name">${this.name}</p>
                <p class="item__info_price">${this.price}</p>
            </div>
        </div>`;
   }

    render() {
        const item = document.createElement('div');
        item.classList.add('item');

        const img = document.createElement('img');
        img.classList.add('item__photo');
        img.src = "img/item6.png";
        img.alt = "item6";
        item.appendChild(img);

        const hover = document.createElement('div');
        hover.classList.add('item-hover');
        item.appendChild(hover);

        const info = document.createElement('div');
        info.classList.add('item__info');

        const name = document.createElement('div');
        name.classList.add('item__info_name');
        name.innerText = this.name;
        info.appendChild(name);

        const price = document.createElement('div');
        price.classList.add('item__info_price');
        price.innerText = this.price;
        info.appendChild(price);

        item.appendChild(info);

        this.element = item;

        return this.element;
    }
}

class Clothes extends Goods {
    constructor(price, name, color, size = 'M'){
        super(price, name);

        this.color = color;
        this.size = size;
    }
}

class Foods extends Goods {
    constructor(price, name, expires = true) {
        super(price, name);

        this.expires = expires;
    }

    get price() {
        return this.price;
    }
    set price(price) {
        this.price = price;
    }

    isFresh() {
        return this.expires;
    }

    buy(count = 1) {
        if(this.isFresh()){
            this.store -= count;
        }
    }

    render() {
        /*const item = */this.render();

        // some action with /*item*/ this.element

        /*this.element = item;*/
        return this.element;
    }
}

const goods1 = new Goods(250, 'T-shirt', 'green');
const goods2 = new Goods(175, 'Shoes', 'black');
console.log(goods1, goods2);

goods1.buy();
goods2.buy(5);

console.log(goods1, goods2);


const arrClothes = [
    new Clothes(175, 'shoes', 'black'),
    new Clothes(175, 'shoes 1', 'black'),
    new Clothes(175, 'shoes 2', 'black'),
    new Clothes(175, 'shoes 3', 'black'),
    new Clothes(175, 'shoes 5', 'black'),
    new Clothes(175, 'shoes 4', 'black'),
    new Clothes(175, 'shoes 21', 'black'),
    new Clothes(175, 'shoes 5', 'black'),
    new Clothes(175, 'shoes 6', 'black'),
    new Clothes(175, 'shoes 7', 'black'),
    new Clothes(175, 'shoes 8', 'black'),
    new Clothes(175, 'shoes 9', 'black'),
    new Clothes(175, 'shoes 0', 'black'),
    new Clothes(175, 'shoes 11', 'black'),
    new Clothes(175, 'shoes 22', 'black'),
    new Clothes(175, 'shoes 11', 'black'),
    new Clothes(175, 'shoes 32', 'black')
];

console.log(arrClothes[0]);

const app = document.getElementById('app');
// const arr =[]
//
for(let el of arrClothes){ // Object.keys(<object>) |.values(<object>)
    if(el.name.match(/2/)){
        el.name = el.name.replace('s', 'T');
        // item.render();
    }
    else {
        el.name = el.name.replace(/s/g, '\'$&\'');
        // item.render();
    }
    app.appendChild(el.render()); // app.innerHTML = app.innerHTML + el.getHtml();
    // arr.push(el);
}

const strSearch = 's';
const regex = new RegExp(`\b${strSearch}\b`, 'gm');



for(let item of arrClothes){
    if(regex.test(item.name)){ // item.name.match(/1/)
        item.element.style.display = 'none';
    }
}


function OldGoods() {
    this.store = 45;
}

OldGoods.prototype.render = function() {
    return `<div class="item">
        <img class="item__photo" src="img/item6.png" alt="item6">
        <div class="item-hover"></div>
        <div class="item__info">
            <p class="item__info_name">name</p>
            <p class="item__info_price">price</p>
        </div>
    </div>`;
}

const oldGoods = new OldGoods();
console.log(oldGoods, oldGoods.render());

function OldClothes(color, size = 'M') {
    const parent = new OldGoods();
    for(let prop in parent) {
        this[prop] = parent[prop];
    }

    this.color = color;
    this.size = size;
}
OldClothes.prototype = Object.create(OldGoods.prototype);
OldClothes.prototype.constructor = OldClothes;

const oldClothes = new OldClothes('red');
console.log(oldClothes, oldClothes.render());


// const xhr = new XMLHttpRequest();
//
// xhr.onreadystatechange = function() {
//     // console.log('onreadystatechange');
//     // console.log(xhr);
//     // debugger
//     if(xhr.readyState === 4){
//         console.log(xhr.responseText);
//         console.log(JSON.parse(xhr.responseText));
//
//         const res = JSON.parse(xhr.responseText);
//         for(let i of res){
//             const item = new Goods(i.price, i.product_name);
//             app.appendChild(item.render());
//         }
//     }
// }
//
//
// xhr.open(
//     'GET',
//     'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/catalogData.json',
//     true
// );
// xhr.send();


// setTimeout(
//     function(){
//         console.log('setTimeout');
//     },
//     2000
// );

const sum = function (a, b, callbackFunction = null){
    setTimeout(
        () => {
            const res = a + b;
            if(callbackFunction) {
                callbackFunction(res);
            }
            // return res;
        },
        2000
    );
};

sum(5, 6, console.log);


const promise = new Promise((resolve, reject) => { // (then, catch)
    setTimeout(
        () => {
            const a = Math.round(Math.random() * 10);
            const b = Math.round(Math.random() * 10);
            const sum = a + b;

            if(sum < 15){
                resolve(sum);
            }
            else {
                reject('So very big int');
            }
        },
        2000
    );
});

promise.then(sum => {
    console.log('sum', sum);
}).catch(console.error);


const func = () => {
    fetch(
        'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/catalogData.json',
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
        let arr = [];
        for (let i of res) {
            const item = new Goods(i.price, i.product_name + '_fetch');
            app.appendChild(item.render());
            arr.push(item);
        }




    }).catch(error => {
        setTimeout(
            () => {
                console.log('catch error!', error);
                func();
            },
            5000
        );
    });
};

// func();



const goods222 = {
    price: 100,
    name: 'T-short',
    size: 'L',
    color: 'red'
};

// app.innerText = JSON.stringify(goods222);



class Cart {
    constructor() {
    }

    addItem(){
       /*
        Этот метод добавляет переданный товар в корзину
       */
    }

    /**
     * Удалят товар из корзины
     * @param id int - идентификатор товара
     * @return bool - успешность удаления
     */
    removeItem(id){
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

const arr = [1, 5, 1, 7, 2, 4, 5, 7];

console.log(arr);
console.log([...new Set(arr)]);

function makeGETRequest(url, callback) {
    let xhr; // var -> let

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhr.onreadystatechange = () => { // classic function -> lambda function
        if (xhr.readyState === 4) {
            callback(xhr.responseText);
        }
    }

    xhr.open('GET', url, true);
    xhr.send();
}

makeGETRequest('https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/catalogData.json', r => console.log('end', r));


// /*input*/.addEventListener('change', () => {})