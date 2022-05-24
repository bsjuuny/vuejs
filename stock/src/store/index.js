import Vue from "vue";
import Vuex from "vuex";
import { getAuthFromCookie } from "@/utils/cookies";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: getAuthFromCookie() || "", // 쿠키에 저장된 토큰 값이거나 빈값
    username: "",
    socket: {
      isConnected: false,
      message: "",
      reconnectError: false,
    },
    coinList: [],
    pear: [],
  },
  // watch
  getters: {
    isLogin(state) {
      return state.username !== "";
    },
    getCoinList(state) {
      return state.coinList;
    },
  },
  // setState
  mutations: {
    setToken(state, payload) {
      state.token = payload;
    },
    setUsername(state, payload) {
      state.username = payload;
    },
    SOCKET_ONOPEN(state, event) {
      Vue.prototype.$socket = event.currentTarget;
      state.socket.isConnected = true;
    },
    SOCKET_ONCLOSE(state, event) {
      alert("연결이 종료되었습니다.");
      state.socket.isConnected = false;
      console.log(event);
    },
    SOCKET_ONERROR(state, event) {
      console.error(state, event);
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE(state, message) {
      state.socket.message = message;
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT(state, count) {
      console.info(state, count);
    },
    SOCKET_RECONNECT_ERROR(state) {
      state.socket.reconnectError = true;
    },
    createCoinList(state, list) {
      state.coinList = list;
    },
    changeCoinInformation(state, evt) {
      var enc = new TextDecoder("utf-8");
      var arr = new Uint8Array(evt.data);
      let forObject = new Object();

      let textArray = new Array(enc.decode(arr));
      textArray = textArray.toString().replace(/\{|\}|"/gi, "");
      textArray = textArray.split(",");

      textArray.forEach((element) => {
        let forSplit = element.split(":");
        forObject[forSplit[0]] = forSplit[1];

        if (forSplit[0] === "code" && state.pear[forSplit[1]]) {
          forObject["pear"] = state.pear[forSplit[1]].stage;
          forObject["koreanName"] = state.pear[forSplit[1]].korean_name;
        }
      });
      state.coinList[forObject.code] = forObject;
    },
    changePear(state) {
      return axios
        .get("https://datavalue.dunamu.com/api/fearindex")
        .then((res) => {
          let pairs = res.data.pairs;
          pairs.forEach((element) => {
            element.code = element.code.split(".")[1];

            let tempCoinList = state.coinList;
            Object.fromEntries(
              Object.entries(tempCoinList).filter(([key]) => {
                if (key === element.code) {
                  state.pear[element.code] = element;
                }
              })
            );
          });
        })
        .catch((err) => {
          console.log("Error happened: " + err);
          // alert(err);
          // return Promise.reject(err);
        });
    },
  },
  actions: {
    sendMessage: function (context, message) {
      Vue.prototype.$socket.send(message);
    },
    pollPear(context) {
      context.commit("changePear");
      return setInterval(function () {
        context.commit("changePear");
      }, 1000 * 60 * 10);
    },
  },
  modules: {},
});
