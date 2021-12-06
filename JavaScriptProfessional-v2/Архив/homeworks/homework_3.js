function makeGETRequest(url) {
    return new Promise((resolve, reject) => {
        const xhr = window.XMLHttpRequest && new XMLHttpRequest() ||
                    window.ActiveXObject && new ActiveXObject("Microsoft.XMLHTTP") || null;
        if(!xhr){
            return reject();
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                return resolve(xhr.responseText);
            }
        }

        xhr.open('GET', url, true);
        xhr.send();
    });
}

class Cart {
    constructor(items = []){
        this.items = items
    }

    get items(){}
    set items(items){}

    /**
     * Добавление товара в корзину
     * @param item - товар для добавления
     * @return bool - успешность добавления в корзину
     */
    addItem(item){
        makeGETRequest(
            'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/addToBasket.json'
        ).then(res => {
            if(res){
                res = JSON.parse(res);
            }
            if(res?.result){
                this.items.push(item);
                return true;
            }
            else {
                return false;
            }
        }).catch(err => {
            console.error(err);
            return false;
        });
    }

    /**
     * Удаление товара из корзины
     * @param id - id товра в корзине
     * @return bool - успешность удаления из корзины
     */
    removeItem(id){
        makeGETRequest(
            'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/deleteFromBasket.json?id='+id
        ).then(res => {
            if(res){
                res = JSON.parse(res);
            }
            if(res?.result){
                this.items.splice(id, 1);
                return true;
            }
            else {
                return false;
            }
        }).catch(err => {
            console.error(err);
            return false;
        });
    }

    getItems(){
        makeGETRequest(
            'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/getBasket.json'
        ).then(res => {
            if(res){
                res = JSON.parse(res);
            }
            if(res?.result && res?.contents && res.contents.length > 0){
                this.items = [...res.contents];
                return true;
            }
            else {
                return false;
            }
        }).catch(err => {
            console.error(err);
            return false;
        });
    }
}