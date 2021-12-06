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
    addItem(item){}

    /**
     * Удаление товара из корзины
     * @param id - id товра в корзине
     * @return bool - успешность удаления из корзины
     */
    removeItem(id){}

    /**
     * Добавление количества товара
     * @param id - id товра в корзине
     * @param count - добавляемое количество
     * @return bool - успешность добавления количества товара в корзине
     */
    addItemQuantity(id, count = 1){}

    /**
     * Удаление количества товара
     * @param id - id товра в корзине
     * @param count - удаляемое количество
     * @return bool - успешность удаления количества товара в корзине
     */
    removeItemQuantity(id, count = 1){}

    /**
     * Отчистка корзины
     * @return bool - успешность отчистки корзины
     */
    clear(){}

    /**
     * Создание заказа
     * @return bool - успешность создания заказа
     */
    submit(){}

    /**
     * Отрисовка корзины
     * @return bool - успешность отрисовки корзины
     */
    render(){}
}

class CartItem {
    constructor(id, name, price, quantity = 1){
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    get id(){}
    set id(id){}

    get name(){}
    set name(name){}

    get price(){}
    set price(price){}

    get quantity(){}
    set quantity(quantity){}
}


function goodsSum(goods){
    return goods.reduce((res, {price}) => res + price, 0);
}