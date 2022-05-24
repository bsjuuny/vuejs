<template>
  <div>
    <h1>Coin <sub>(UPBIT API)</sub></h1>
    <button @click="$router.push('/login')">Click to Navigate</button>
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
        "KRW-MLK",
        "KRW-OMG",
        "KRW-XLM",
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
  created() {
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
  },
  mounted() {
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

<style lang="scss" scoped>
h1 {
  margin: 30px 0 0;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  sub {
    font-size: 14px;
    color: #999;
  }
}
ul {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  margin: 10px 0 0;
}
li {
  display: flex;
  width: 320px;
  margin: 10px auto 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 5px 4px 25px -4px #ddd;
}
li > div:last-of-type {
  margin: 0 0 0 auto;
}
.coin {
  display: inline-block;
  margin: 0 10px 0 0;
  font-size: 16px;
  font-weight: bold;
}
.koreanName {
  display: block;
  margin: 3px 0 0;
  font-size: 14px;
}
.indices {
  display: inline-block;
  margin: 3px 0 0;
  padding: 1px 3px 2px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 5px;
}
.indices.veryFear {
  background-color: blue;
  color: #fff;
}
.indices.fear {
  background-color: skyblue;
}
.indices.neutrality {
  background-color: green;
  color: #fff;
}
.indices.avarice {
  background-color: orange;
}
.indices.veryAvarice {
  background-color: red;
  color: #fff;
}
.price {
  display: block;
  margin: 0 0 0 auto;
  font-size: 22px;
  font-weight: bold;
  text-align: right;
  color: green;
}
.price sup {
  font-size: 12px;
}
.price.rise {
  color: red;
}
.price.fall {
  color: blue;
}
li .start {
  display: block;
  margin: 5px 0 0;
  font-size: 13px;
  text-align: right;
}
li .average {
  display: block;
  font-size: 14px;
  text-align: right;
}
@media (min-width: 640px) {
  li {
    margin: 20px 5px 0;
  }
}
</style>
