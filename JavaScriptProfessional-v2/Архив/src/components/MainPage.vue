<template>
  <div>
    <header>
      <div class="header container">
        <div class="header-left">
          <h1>Hi!</h1>
          <Search v-on:search="filter" v-on:error="showError"/>
        </div>
        <div class="header-right">
          <Basket/>
        </div>
      </div>
      <div class="header-line"></div>
    </header>
    <main>
      <Catalog :items="filteredItems"/>
    </main>
  </div>
</template>

<script>
import Search from './Search.vue';
import Basket from './Basket.vue';
import Catalog from './Catalogue.vue';

export default {
  name: 'MainPage',
  components: {Search, Basket, Catalog},
  data() {
    return {
      items: [
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes', img: 'img/item6.png'},
        {price: 175, name: 'Shoes_new', img: 'img/item6.png'}
      ],
      searchText: ''
    };
  },
  computed: {
    filteredItems() {
      return this.searchText.length > 0 ?
          this.items.filter(({name}) => name.includes(this.searchText)) :
          this.items;
    }
  },
  methods: {
    filter(text){
      this.searchText = text;

      // const str = this.searchText?.length || -1;

      // console.log('catch emit', text);
    },
    showError(){
      // TODO
    }
  }
};
</script>

<style>
</style>