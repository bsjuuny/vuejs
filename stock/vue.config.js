const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const fs = require("fs");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    open: process.platform === "darwin",
    host: "0.0.0.0",
    port: 8080,
    https: {
      key: fs.readFileSync(".certs/key.pem"),
      cert: fs.readFileSync(".certs/cert.pem"),
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
        // additionalData: '@import "@/assets/css/style.scss";',
      },
    },
  },
  assetsDir: "@/assets/",
});
