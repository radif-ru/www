<template>
  <div class="item">
    <img class="item__photo" v-bind:src="img" alt="item6">
    <div class="item-hover"></div>
    <div class="item__info">
      <p class="item__info_name">{{name}}</p>
      <p class="item__info_price">{{price}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CatalogueItem',
  props: ['img', 'name', 'price']
};
</script>

<style scoped lang="scss">
.item__info {
  margin-top: 19px;
  margin-left: 15px;
  margin-bottom: 20px;
}

.item__info_name {
  font-family: Lato;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
  text-transform: uppercase;
  color: #222222;
}

.item__info_price {
  font-family: Lato;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 700;
  text-transform: uppercase;
  color: #f16d7f;
}

.item {
  margin-bottom: 39px;
  transition-duration: 0.3s;
}

.item:hover {
  box-shadow: 0 0 15px #a4a4a4;
  transition-duration: 0.3s;
}

.item-hover {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 261px;
  height: 280px;
  position: relative;
  background-color: rgba(58, 56, 56, 0.8);
  opacity: 0;
}

.item:hover .item-hover {
  opacity: 1;

}

.item__photo {
  position: absolute;
}
</style>