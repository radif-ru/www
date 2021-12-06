class Order {
    constructor(products = []) {
        this.products = products
        this._calculate()
    }

    _calculate() {
        this.price = 0;
        this.calories = 0;
        for (let product in this.products) {
            this.price += this.products[product].price;
            this.calories += this.products[product].calories
        }
    }

    getPrice() {
        return this.price
    }

    getCalories() {
        return this.calories
    }
}

class Products {
    products = {
        burgers: {
            small: {
                price: 50,
                calories: 20,
            },
            big: {
                price: 100,
                calories: 40,
            },
        },
        toppings: {
            cheese: {
                price: 10,
                calories: 20,
            },
            salad: {
                price: 20,
                calories: 5,
            },
            potato: {
                price: 15,
                calories: 10,
            },
        },
        seasoning: {
            price: 15,
            calories: 0,
        },
        mayonnaise: {
            price: 20,
            calories: 5,
        },
    }

    productSelection(products = this.products) {
        let selected_products = []
        while (1) {
            alert("Добро пожаловать в бургерную!")
            let selected_burger = +prompt(`Какой бургер выбираете?\n
        1. Большой\n
        2. Маленький
        `)

            if (selected_burger === 1) {
                selected_products.push(products.burgers.big)
            } else if (selected_burger === 2) {
                selected_products.push(products.burgers.small)
            }

            while (1) {
                let selected_toppings = +prompt(`Какую начинку добавить?\n
        1. Сыр\n
        2. Салат\n
        3. Картофель`)

                if (selected_toppings === 1) {
                    selected_products.push(products.toppings.cheese)
                } else if (selected_toppings === 2) {
                    selected_products.push(products.toppings.salad)
                } else if (selected_toppings === 3) {
                    selected_products.push(products.toppings.potato)
                }

                let question = confirm(`Добавить ещё начинку?`)
                if (question === false) {
                    break
                }
            }

            let question = confirm(`Добавить майонез?`)
            if (question === true) {
                selected_products.push(products.mayonnaise)
            }

            question = confirm(`Добавить приправу?`)
            if (question === true) {
                selected_products.push(products.seasoning)
            }

            question = confirm(`Ещё один бургер?`)
            if (question === false) {
                break
            }

        }
        return selected_products
    }

}

my_products = new Products()
my_order = new Order(my_products.productSelection())
alert(`Итоговая цена: ${my_order.getPrice()}\n
Количество калорий: ${my_order.getCalories()}`)
window.history.back();