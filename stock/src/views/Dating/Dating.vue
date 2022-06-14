/* eslint-disable no-unused-vars */
<template>
  <div>
    <span v-if="$geolocation.loading">Loading location...</span>
    <span v-else-if="!$geolocation.supported"
      >Geolocation API is not supported</span
    >
    <span>{{ $geolocation.coords }}</span
    ><br /><br />
    <span>{{ $geolocation.coords.latitude }}</span> /
    <span>{{ $geolocation.coords.longitude }}</span>

    <div id="map_div" style="display: block; width: 100%; height: 500px"></div>
    <div>
      <button type="button" v-on:click.prevent="setLocalStorage()">
        현재 위치 저장
      </button>
      <button type="button" v-on:click.prevent="clearLocalStorage()">
        초기화
      </button>
      <input
        type="text"
        v-model="searchText"
        name="search"
        placeholder="검색어를 입력하세요"
      />
      <button type="button" v-on:click.prevent="getSearch()">검색</button>
      <p>검색결과 없음</p>
      <ul style="">
        <li style="padding: 5px 0 0 20px">
          <span>
            <sub
              style="
                display: inline-block;
                margin: 0 0 0 10px;
                fontsize: 12px;
                color: #999;
                verticalalign: 2px;
              "
            >
            </sub>
          </span>
          <button
            type="button"
            data-x=""
            data-y=""
            style="
              display: inline-block;
              margin: 0 0 0 10px;
              verticalalign: 2px;
            "
          >
            선택
          </button>
        </li>
      </ul>
      <ul>
        <li v-for="(value, index) in getSavedLocation" v-bind:key="value">
          {{ value.location }} {{ index }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";

var setMap = null;
/* eslint-disable no-undef */
export default {
  name: "Dating",
  data() {
    return {
      searchText: "",
      currentCoords: [],
      defaultMarkers: [],
      searchMarkers: [],
      getSavedLocation: [],
    };
  },
  methods: {
    getMyInfo() {
      this.currentCoords = [
        new Tmapv2.LatLng(
          this.$geolocation.coords.latitude,
          this.$geolocation.coords.longitude
        ),
      ];

      setMap = new Tmapv2.Map("map_div", {
        center: this.currentCoords[0],
        width: "100%",
        height: "500px",
        zoom: 16,
      });
      this.addMarkerAni(Tmapv2.MarkerOptions.ANIMATE_FLICKER);
    },
    addMarkerAni(aniType) {
      this.removeMarkers();

      var marker = new Tmapv2.Marker({
        position: this.currentCoords[0],
        draggable: true,
        animation: aniType,
        animationLength: 500,
        label: '<span style="font-weight: bold; color: red;">현 위치</span>',
        title: "타이틀",
        map: setMap,
      });
      this.defaultMarkers.push(marker);
    },
    removeMarkers() {
      if (!this.defaultMarkers || this.defaultMarkers <= 0) return false;
      for (var i = 0; i < this.defaultMarkers.length; i++) {
        this.defaultMarkers[i].setMap(null);
      }
      this.defaultMarkers = [];
    },
    async getSearch() {
      const KAKAO_KEY = process.env.VUE_APP_KAKAO_KEY;
      const search_radius = 600;
      const search_size = 15;
      let search_page = 1;
      const search = this.searchText;

      try {
        if (search !== "") {
          const response = await axios.get(
            "https://dapi.kakao.com/v2/local/search/keyword.json",
            {
              params: {
                query: search,
                radius: search_radius,
                size: search_size,
                page: search_page,
                x: this.$geolocation.coords.longitude,
                y: this.$geolocation.coords.latitude,
              },
              headers: {
                Authorization: KAKAO_KEY,
              },
            }
          );

          let getCoords = [];
          response.data.documents.map((value, index) => {
            let getData = value["category_name"].split(">");
            value["category_name_detail"] = getData[getData.length - 1].trim();
            getCoords[index] = {
              lat: value["y"],
              lng: value["x"],
              title: value["place_name"],
              index: index + 1,
            };
          });
          this.addSearchMaker(getCoords);
          this.$store.commit("datingSearchResult", response, false);
        }
      } catch (error) {
        console.log(error);
      }
    },
    addSearchMaker(getCoords) {
      var coords1 = getCoords;
      var coordIdx1 = 0;

      this.removeAddedMarkers();

      // eslint-disable-next-line no-unused-vars
      var searchMarkers = this.searchMarkers;
      var func = function () {
        //Marker 객체 생성.
        var marker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(
            coords1[coordIdx1].lat,
            coords1[coordIdx1].lng
          ), //Marker의 중심좌표 설정.
          label: coords1[coordIdx1].index, //Marker의 라벨.
          title: coords1[coordIdx1].index + " " + coords1[coordIdx1].title, //Marker 타이틀.
          map: setMap, //Marker가 표시될 Map 설정.
        });

        searchMarkers.push(marker);
        coordIdx1++;

        if (coordIdx1 < coords1.length) {
          // 일정 시간 간격으로 마커를 생성하는 함수를 실행합니다
          setTimeout(func, 1000);
        }
      };
      // 일정 시간 간격으로 마커를 생성하는 함수를 실행합니다
      setTimeout(func, 1000);
    },
    removeAddedMarkers() {
      for (var i = 0; i < this.searchMarkers.length; i++) {
        this.searchMarkers[i].setMap(null);
      }
      this.searchMarkers = [];
    },
    setLocalStorage() {
      let getStorage = [];
      let getDate = dayjs().format("YYYYMMDD");
      if (!this.$localStorage.hasKey(getDate)) {
        this.$localStorage.set(getDate, [
          {
            location: {
              lat: this.$geolocation.coords.latitude,
              lng: this.$geolocation.coords.longitude,
            },
          },
        ]);
      } else {
        getStorage = this.$localStorage.get(getDate);
        let newStorage = {
          location: {
            lat: this.$geolocation.coords.latitude,
            lng: this.$geolocation.coords.longitude,
          },
        };
        getStorage.push(newStorage);
        this.$localStorage.set(getDate, getStorage);
      }

      let keys = this.$localStorage.keys();
      keys.map((value) => {
        this.getSavedLocation = this.$localStorage.get(value);
      });
      // console.log(keys);
      //this.getSavedLocation = ;
    },
    clearLocalStorage() {
      this.$localStorage.clear();
      this.getSavedLocation = [];
    },
  },
  created() {},
  mounted() {
    this.getMyInfo();
  },
  updated() {},
};
</script>

<style lang="scss">
button {
  display: inline-block;
  margin: 10px 5px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
input {
  display: inline-block;
  margin: 10px 5px;
  padding: 5px 10px 3px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.6;
  vertical-align: middle;
}
</style>
