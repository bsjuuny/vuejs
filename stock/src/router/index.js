import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/coin",
  },
  {
    path: "/home",
    component: () => import("@/views/Home/Home"),
  },
  {
    path: "/login",
    component: () => import("@/views/Login/Login"),
  },
  {
    path: "/signup",
    component: () => import("@/views/Signup/Signup"),
  },
  {
    path: "/coin",
    component: () => import("@/views/Coin/Coin"),
  },
  {
    path: "/chart",
    component: () => import("@/views/Chart/Chart"),
  },
  {
    path: "/dating",
    component: () => import("@/views/Dating/Dating"),
  },
  {
    path: "/mission",
    component: () => import("@/views/Mission/Mission"),
  },
];

const router = new VueRouter({
  mode: "hash",
  routes,
});

export default router;
