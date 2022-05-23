<template>
  <div>
    <h1>Coin Home 1234</h1>
  </div>
</template>

<script>
import { io } from "socket.io-client";
// import { io } from 'vue-socket.io'

export default {
  data() {
    return {
      socket: null,
      message: "",
      receivedMessage: [],
    };
  },
  async created() {
    // 소켓 서버와 연결한다.
    // 여기서 서버에서 지정해놓은 io.on('connection') 이벤트가 실행된다.
    // 그리고 생성된 소켓을 반환한다.
    console.log("create");
    const server = "wss://api.upbit.com/websocket/v1";
    this.socket = io(server, {
      path: "/",
      // withCredentials: true,
      // cors: {
      //   origin: "http://localhost:8080",
      //   methods: ["GET", "POST"],
      // },
      transports: ["websocket"],
    });
    this.socket.on("connect", () => {
      // 여기서 소켓이 생성되고 반환될 때에 코드를 적는다.
    });
    this.socket.on("messages", (messages) => {
      // 커스텀 이벤트
      this.receivedMessage = messages;
    });
  },
  methods: {
    sendMessage() {
      // 소켓을 통해 서버로 메세지를 보낸다.
      this.socket.emit("send", this.message);
      this.message = "";
    },
  },
};
</script>

<style lang="scss" scoped></style>
