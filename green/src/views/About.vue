<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p>{{ myVar }}</p>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { inject } from "vue";

export default class About extends Vue {
  mounted(): void {
    const axios: any = inject("axios");
    console.log(axios);
    axios.post().then((response: any) => {
      console.log(response);
    });

    // console.log(foo)
  }
}
</script>
