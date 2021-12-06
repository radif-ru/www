<template>
  <section class="catalogue">
    <CatalogItem v-for="(item, id) in items"
                 :key="`catalogue_item_${id}`"
                 :img="`./img/product${id+1}.png`"
                 :price="item.price"
                 :name="item.name"
                 @click="() => addItem(item)"/>
  </section>
</template>

<script>
import CatalogItem from './CatalogueItem.vue';

export default {
  name: 'Catalogue',
  components: {CatalogItem},
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [] // () => ({})
    }
  },
  data(){
    return {
      basketItems: []
    };
  },
  methods: {
    addItem(item){
      this.basketItems.push(item);
    },
    removeItem(item){
      this.basketItems = this.basketItems.splice(
          this.basketItems.findIndex(({id}) => item.id === id),
          1
      );
    },
    addQuantity(item){
      const arr = this.basketItems;
      arr[arr.findIndex(({id}) => item.id === id)].quantity++;
      this.basketItems = [...arr];
    }
  }
};
</script>

<style scoped lang="scss">
.catalogue {
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
}
</style>