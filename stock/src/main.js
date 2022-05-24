import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueNativeSock from "vue-native-websocket";

const wsUri = "wss://api.upbit.com/websocket/v1";
Vue.use(VueNativeSock, wsUri, {
  store: store,
  format: "json",
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 3, // (Number) number of reconnection attempts before giving up (Infinity)
  reconnectionDelay: 10000, // (Number) how long to initially wait before attempting a new (1000)
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
