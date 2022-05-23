<template>
  <div>
    <h1>Coin Home</h1>
    <ul>
      <li v-for="(value, key, index) in responseData" :key="index">
        <div>
          <span class="coin">{{ key }}</span>
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
            >{{ value.trade_price | comma }}</span
          >
          <span class="start"
            >금일 시작가 : {{ value.opening_price | comma }}</span
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
import axios from "axios";

export default {
  name: "Coin",
  data() {
    return {
      websocket: null,
      socket: null,
      requestCoinList: ["KRW-BTC", "KRW-ETH", "KRW-ETC", "KRW-XRP", "KRW-BTT"],
      responseData: [],
      message: null,
      requestList: [],
      pear: [],
    };
  },
  methods: {
    onOpen() {
      this.requestList = [
        {
          ticket: "TEST",
        },
        {
          type: "ticker",
          codes: this.requestCoinList,
        },
      ];
      const requestMessage = JSON.stringify(this.requestList);
      this.doSend(requestMessage);
      this.heartbeat();
    },
    onClose: function (evt) {
      alert("연결이 종료되었습니다.");
      console.error(evt);
    },
    onMessage(evt) {
      var enc = new TextDecoder("utf-8");
      var arr = new Uint8Array(evt.data);
      let forObject = new Object();

      let textArray = new Array(enc.decode(arr));
      textArray = textArray.toString().replace(/\{|\}|"/gi, "");
      textArray = textArray.split(",");

      textArray.forEach((element) => {
        let forSplit = element.split(":");
        forObject[forSplit[0]] = forSplit[1];

        if (forSplit[0] === "code" && this.pear[forSplit[1]]) {
          forObject["pear"] = this.pear[forSplit[1]].stage;
        }
      });
      this.responseData[forObject.code] = forObject;

      //this.websocket.close();
    },
    onError(evt) {
      console.error(evt);
    },
    doSend(message) {
      console.log("발신: " + message);
      this.websocket.send(message);
    },
    heartbeat() {
      if (!this.websocket) return;
      if (this.websocket.readyState !== 1) return;
      console.log("heartbeat");
      this.websocket.send("heartbeat");
      let intervalTime = 1000 * 100;
      setTimeout(this.heartbeat, intervalTime);
    },
    pollPear() {
      axios.get("https://datavalue.dunamu.com/api/fearindex").then((res) => {
        let pairs = res.data.pairs;
        pairs.forEach((element) => {
          element.code = element.code.split(".")[1];

          this.requestCoinList.filter((x) => {
            if (x === element.code) {
              this.pear[element.code] = element;
            }
          });
        });
      });
    },
  },
  created() {
    const that = this;
    const wsUri = "wss://api.upbit.com/websocket/v1";
    that.websocket = new WebSocket(wsUri);
    that.websocket.binaryType = "arraybuffer";

    that.websocket.onopen = function (evt) {
      that.onOpen(evt);
    };
    that.websocket.onclose = function (evt) {
      that.onClose(evt);
    };
    that.websocket.onmessage = function (evt) {
      that.onMessage(evt);
    };
    that.websocket.onerror = function (evt) {
      that.onError(evt);
    };

    let createObject = new Object();
    that.requestCoinList.forEach((element) => {
      createObject[element] = {};
    });
    that.responseData = createObject;
  },
  mounted() {
    let time = 1000 * 60 * 10;
    this.pollPear();
    setInterval(function () {
      this.pollPear();
    }, time);
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
* {
  margin: 0;
  padding: 0;
}
h1 {
  text-align: center;
}
ul {
  display: flex;
  flex-flow: row wrap;
  margin: 20px 0 0;
}
li {
  display: flex;
  width: 320px;
  margin: 20px auto 0;
  list-style: none;
}
.coin {
  display: inline-block;
  margin: 0 10px 0 0;
  font-size: 20px;
  font-weight: bold;
}
li > div:last-of-type {
  margin: 0 0 0 auto;
}
.indices {
  display: block;
  font-size: 16px;
  font-weight: bold;
}
.indices.veryFear {
  color: blue;
}
.indices.fear {
  color: skyblue;
}
.indices.neutrality {
  color: green;
}
.indices.avarice {
  color: orange;
}
.indices.veryAvarice {
  color: red;
}
.price {
  display: block;
  margin: 0 0 0 auto;
  font-size: 22px;
  font-weight: bold;
  text-align: right;
  color: green;
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
  font-size: 14px;
  text-align: right;
}
li .average {
  display: block;
  font-size: 15px;
  text-align: right;
}
@media (min-width: 640px) {
  li {
    margin: 20px 5px 0;
  }
}
</style>
