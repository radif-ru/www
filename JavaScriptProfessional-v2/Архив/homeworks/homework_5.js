new Vue({
    el: '#root',
    data() {
        return {
            searchLine: '',
            goods: [],
            filteredGoods: [],
            isVisibleCart: true
        };
    },
    methods: {
        filterGoods(){
            if(!this.searchLine) {
                this.filteredGoods = [...this.goods];
            }
            else {
                this.filteredGoods = this.goods.filter(({name}) => new RegExp(this.searchLine, 'i').test(name));
            }
        }
    }
});