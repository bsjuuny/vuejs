<template>
  <div>
    <h1>Coin Home</h1>
    <ul>
      <li>
        <span class="coin">KRW-BTC</span>
        <span
          class="price"
          :class="{
            rise: btcChange === 'rise',
            fall: btcChange === 'fall',
          }"
          >{{ btcPrice | comma(2) }}</span
        >
      </li>
      <li>
        <span class="coin">KRW-ETH</span>
        <span
          class="price"
          :class="{
            rise: ethChange === 'rise',
            fall: ethChange === 'fall',
          }"
          >{{ ethPrice | comma(2) }}</span
        >
      </li>
      <li>
        <span class="coin">KRW-ETC</span>
        <span
          class="price"
          :class="{
            rise: etcChange === 'rise',
            fall: etcChange === 'fall',
          }"
          >{{ etcPrice | comma(2) }}</span
        >
      </li>
      <li>
        <span class="coin">KRW-XRP</span>
        <span
          class="price"
          :class="{
            rise: xrpChange === 'rise',
            fall: xrpChange === 'fall',
          }"
          >{{ xrpPrice | comma(2) }}</span
        >
      </li>
      <li
        v-for="data in responseData"
        :key="data.code"
        :class="{ rise: data.change === 'RISE', fall: data.change === 'FALL' }"
      >
        {{ data.code }} | {{ data.trade_price | comma }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Coin",
  data() {
    return {
      websocket: null,
      socket: null,
      responseData: [],
      message: null,
      receivedMessage: [],
      requestCoinList: ["KRW-BTC", "KRW-XRP", "KRW-ETH", "KRW-ETC"],
      requestList: [],
      btcPrice: 0,
      btcChange: "",
      xrpPrice: 0,
      xrpChange: "",
      ethPrice: 0,
      ethChange: "",
      etcPrice: 0,
      etcChange: "",
    };
  },
  methods: {
    onOpen(evt) {
      console.log(evt);
      this.requestList = [
        {
          ticket: "TEST",
        },
        {
          type: "ticker",
          codes: this.requestCoinList,
        },
      ];
      this.receivedMessage = JSON.stringify(this.requestList);
      this.doSend(this.receivedMessage);
      this.heartbeat();
    },
    onClose: function (evt) {
      alert("연결이 종료되었습니다.");
      console.error(evt);
    },
    onMessage(evt) {
      var enc = new TextDecoder("utf-8");
      var arr = new Uint8Array(evt.data);
      this.responseData = [];
      let forObject = new Object();

      let textArray = new Array(enc.decode(arr));
      textArray = textArray.toString().replace(/\{|\}|"/gi, "");
      textArray = textArray.split(",");

      textArray.forEach((element) => {
        let forSplit = element.split(":");
        forObject[forSplit[0]] = forSplit[1];
      });
      console.log(forObject);
      this.responseData.push(forObject);

      if (this.responseData[0].code === "KRW-XRP") {
        this.xrpPrice = this.responseData[0].trade_price;
        if (this.responseData[0].change.toLowerCase() === "rise") {
          this.xrpChange = "rise";
        } else {
          this.xrpChange = "fall";
        }
      }
      if (this.responseData[0].code === "KRW-BTC") {
        this.btcPrice = this.responseData[0].trade_price;
        if (this.responseData[0].change.toLowerCase() === "rise") {
          this.btcChange = "rise";
        } else {
          this.btcChange = "fall";
        }
      }
      if (this.responseData[0].code === "KRW-ETH") {
        this.ethPrice = this.responseData[0].trade_price;
        if (this.responseData[0].change.toLowerCase() === "rise") {
          this.ethChange = "rise";
        } else {
          this.ethChange = "fall";
        }
      }
      if (this.responseData[0].code === "KRW-ETC") {
        this.etcPrice = this.responseData[0].trade_price;
        if (this.responseData[0].change.toLowerCase() === "rise") {
          this.etcChange = "rise";
        } else {
          this.etcChange = "fall";
        }
      }
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
  },
  created() {
    const that = this;
    const wsUri = "wss://api.upbit.com/websocket/v1";
    this.websocket = new WebSocket(wsUri);
    this.websocket.binaryType = "arraybuffer";

    this.websocket.onopen = function (evt) {
      that.onOpen(evt);
      //console.log("open", evt);
    };
    this.websocket.onclose = function (evt) {
      that.onClose(evt);
      //console.log("close", evt);
    };
    this.websocket.onmessage = function (evt) {
      that.onMessage(evt);
      //console.log(evt);
    };
    this.websocket.onerror = function (evt) {
      that.onError(evt);
      //console.log(evt);
    };
  },
  filters: {
    comma(value, numFix) {
      value = parseFloat(value);
      if (!value) return "0";
      return value
        .toFixed(numFix)
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      //return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // return val.toFixed("2").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      //return val.toLocaleString("ko-KR");
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
  margin: 20px 20px 0;
}
li {
  list-style: none;
}
.coin {
  display: inline-block;
  margin: 0 10px 0 0;
  font-size: 20px;
  font-weight: bold;
}
.price {
  font-size: 22px;
  font-weight: bold;
}
.price.rise {
  color: red;
}
.price.fall {
  color: blue;
}
</style>
