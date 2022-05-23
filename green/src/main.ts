import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import VueAxios from "vue-axios";

axios.defaults.baseURL = "http://localhost:8001";
axios.defaults.headers.common.Authorization = "something";
axios.defaults.headers.get.Accepts = "application/json";

// Request Interceptor
const reqInterceptor = axios.interceptors.request.use(
  (config) => {
    console.log("Request Interceptor", config);
    console.log(config.headers);
    // 헤더를 변경하려면 headers 오브젝트를 변경한다
    // config.headers["Authorization"] = "something others";
    // 임의의 헤더를 새로 설정할 수 있다
    // config.headers["SOMETHING"] = "some value";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
const resInterceptor = axios.interceptors.response.use(
  (res) => {
    console.log("Response Interceptor", res);
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request Interceptor를 제거한다
axios.interceptors.request.eject(reqInterceptor);
// Response Interceptor를 제거한다
axios.interceptors.response.eject(resInterceptor);

const app = createApp(App).use(store).use(router);
app.use(VueAxios, axios);
app.provide("axios", app.config.globalProperties.axios);
// app.provide('$axios', axios)
// app.provide('$foo', 'bar')
app.mount("#app");
