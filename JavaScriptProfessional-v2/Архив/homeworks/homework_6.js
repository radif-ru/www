Vue.component('search', {
    template: `<label>
        <input type="text" v-model="searchLine"/>
        <span @click="filterGoods">search</span>
    </label>`,
    data() {
        return {
            searchLine: ''
        };
    },
    methods: {
        filterGoods(){
            this.$emit('search', this.searchLine);
        }
    }
});

Vue.component('basket', {
    template: `<div>
        <div v-if="isVisibleCart">cart</div>
        <div v-show="isVisibleCart">cart</div><!-- toggle display -->
        <span @click="isVisibleCart = !isVisibleCart">toggle cart</span>
    </div>`,
    data() {
        return {
            isVisibleCart: true,
            items: []
        };
    },
    // TODO homework_7
    methods: {
        addItem(item){
            fetch(
                'http://localhost:5000/cart/product',
                {
                    method: 'post',
                    body: JSON.stringify(item)
                }
            ).then(res => res.json()).then(res => {
                if(res?.result){
                    this.items.push(item);
                }
            }).catch(console.error);
        },
        removeItem(id){
            fetch(
                'http://localhost:5000/cart/product',
                {
                    method: 'DELETE',
                    body: JSON.stringify({id}) // {id: id}
                }
            ).then(res => res.json()).then(res => {
                if(res?.result){
                    this.items.splice(id, 1);
                }
            }).catch(console.error);
        }
    }
});

Vue.component('catalog', {
    template: `<div v-for="item in goods"><catalog-item :item="item"/></div>`,
    props: ['goods']
});

Vue.component('catalog-item', {
    template: `<div></div>`,
    props: ['item']
});

new Vue({
    el: '#root',
    data() {
        return {
            goods: [],
            filteredGoods: []
        };
    },
    methods: {
        filterGoods(searchLine){
            if(!searchLine) {
                this.filteredGoods = [...this.goods];
            }
            else {
                this.filteredGoods = this.goods.filter(({name}) => new RegExp(searchLine, 'i').test(name));
            }
        }
    }
});