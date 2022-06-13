const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "auto",
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
