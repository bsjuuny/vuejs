import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueNativeSock from "vue-native-websocket";
import VueGeolocationApi from "vue-geolocation-api";

const wsUri = "wss://api.upbit.com/websocket/v1";
Vue.use(VueNativeSock, wsUri, {
  store: store,
  format: "json",
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 3, // (Number) number of reconnection attempts before giving up (Infinity)
  reconnectionDelay: 10000, // (Number) how long to initially wait before attempting a new (1000)
});

Vue.use(VueGeolocationApi, {
  watch: true,
  enableHighAccuracy: true,
  timeout: 1000 * 60 * 1, // 1 min (1000 ms * 60 sec * 1 minute = 60 000ms)
  maximumAge: 1000 * 3600 * 24, // 24 hour
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
