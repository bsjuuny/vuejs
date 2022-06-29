<template>
  <div>
    <template>
      <router-view></router-view>
      <Navigation />
    </template>
  </div>
</template>

<script>
import Navigation from "./components/common/Navigation";

export default {
  components: {
    Navigation,
  },
  computed: {
    isUserLogin() {
      return this.$store.getters.isLogin;
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/css/style.scss";
</style>
