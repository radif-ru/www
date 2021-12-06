<template>
  <a href="#">
    <div class="header__cart">
      <img src="img/cart.svg" alt="cart">
    </div>
  </a>
</template>

<script>
export default {
  name: 'Basket',
  data() {
    return {
      items: []
    }
  },
  methods: {
    addItem(item){
      this.items.push(item);
    }
  }
};
</script>

<style>

</style>