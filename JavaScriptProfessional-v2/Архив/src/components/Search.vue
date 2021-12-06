<template>
  <label>
    <input type="text" v-model="search"/>
    <span @click="() => $emit('search', search)">search1</span>
  </label>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      search: ''
    };
  }
};
</script>

<style>

</style>