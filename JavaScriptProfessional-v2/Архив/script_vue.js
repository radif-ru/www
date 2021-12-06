import MainPage from './src/components/MainPage.vue';
import Vue from 'vue';
import {Goods, Clothes} from './script.js';

console.log(Goods);
console.log(Clothes);

new Vue({
    el: '#root',
    render: h => h(MainPage),
    components: {MainPage},
    template: '<MainPage/>'
});