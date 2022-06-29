<template>
  <div class="coinList">
    <h1>Coin <sub>(UPBIT API)</sub></h1>
    <ul>
      <li v-for="(value, key, index) in responseData" :key="index">
        <div>
          <span class="coin">{{ key }}</span>
          <span class="koreanName">{{ value.koreanName }}</span>
          <span
            class="indices"
            :class="{
              veryFear: value.pear === '매우 공포',
              fear: value.pear === '공포',
              neutrality: value.pear === '중립',
              avarice: value.pear === '탐욕',
              veryAvarice: value.pear === '매우 탐욕',
            }"
            >{{ value.pear }}</span
          >
        </div>
        <div>
          <span
            class="price"
            :class="{
              rise: value.change === 'RISE',
              fall: value.change === 'FALL',
            }"
            >{{ value.trade_price | comma }}
            <sup
              >(<span v-if="value.change === 'RISE'">+</span
              ><span v-else-if="value.change === 'FALL'">-</span
              >{{ value.change_price | comma }})</sup
            ></span
          >
          <span class="start"
            >시작가 : {{ value.prev_closing_price | comma }}</span
          >
          <span class="average"
            >52주 : {{ value.highest_52_week_price | comma }} /
            {{ value.lowest_52_week_price | comma }}</span
          >
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Coin",
  data() {
    return {
      requestCoinList: [
        "KRW-BTC",
        "KRW-ETH",
        "KRW-ETC",
        "KRW-XRP",
        "KRW-ADA",
        "KRW-STEEM",
        "KRW-DOGE",
        "KRW-OMG",
        "KRW-BORA",
        "KRW-MLK",
        "KRW-REP",
      ],
      responseData: [],
    };
  },
  methods: {
    onOpen() {
      let requestList = [
        {
          ticket: "UNIQUE_TICKET",
        },
        {
          type: "ticker",
          codes: this.requestCoinList,
        },
      ];
      const requestMessage = JSON.stringify(requestList);
      this.doSend(requestMessage);
      this.heartbeat();
    },
    onMessage(evt) {
      this.$store.commit("changeCoinInformation", evt);
    },
    doSend(message) {
      this.$store.dispatch("sendMessage", message);
    },
    heartbeat() {
      if (!this.$socket) return;
      if (this.$socket.readyState !== 1) return;
      this.$store.dispatch("sendMessage", "heartbeat");
      let intervalTime = 1000 * 100;
      setTimeout(this.heartbeat, intervalTime);
    },
  },
  created() {},
  mounted() {
    const that = this;

    let createObject = new Object();
    that.requestCoinList.forEach((element) => {
      createObject[element] = {};
    });
    this.$store.commit("createCoinList", createObject);

    this.$store.dispatch("pollPear");

    that.$socket.binaryType = "arraybuffer";
    that.$socket.onopen = function (evt) {
      that.onOpen(evt);
    };
    this.$socket.onmessage = function (evt) {
      that.onMessage(evt);
    };

    this.responseData = this.$store.getters.getCoinList;
  },
  filters: {
    comma(value) {
      value = parseFloat(value);
      if (!value) return "0";
      return value.toLocaleString("ko-KR");
    },
  },
};
</script>

<style lang="scss"></style>
