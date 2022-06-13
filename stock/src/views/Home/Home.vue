<template>
  <div>
    <h1>TradingView</h1>

    <VueTradingView
      :options="{
        symbol: 'KRX:005930',
        theme: 'light',
        width: '100%',
        height: '500',
        interval: '15',
        timezone: 'Asia/Seoul',
        locale: 'kr',
      }"
    />
  </div>
</template>

<script>
import VueTradingView from "vue-trading-view";
export default {
  components: {
    VueTradingView,
  },
  props: {
    msg: String,
  },
};
</script>

<style lang="scss" scoped></style>
