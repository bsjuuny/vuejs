const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "auto",
    client: {
      overlay: false,
      webSocketTransport: "ws",
    },
    webSocketServer: "ws",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.join(__dirname, "src/"),
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        // sassOptions: {
        //   includePaths: [path.resolve(__dirname, "src/core/")],
        //   indentedSyntax: true,
        // },
        additionalData: '@import "~@/assets/css/style.scss";',
      },
    },
  },
  assetsDir: "@/assets/",
});
