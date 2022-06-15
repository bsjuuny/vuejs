/* eslint-disable no-unused-vars */
<template>
  <div>
    <span v-if="$geolocation.loading">Loading location...</span>
    <span v-else-if="!$geolocation.supported"
      >Geolocation API is not supported</span
    >
    <span>{{ $geolocation.coords }}</span>

    <div id="map_div"></div>
    <div>
      <div>
        <button type="button" v-on:click.prevent="setLocalStorage">
          현재 위치 저장
        </button>
        <button type="button" v-on:click.prevent="clearLocalStorage">
          초기화
        </button>
      </div>
      <div>
        <input
          type="text"
          v-model.trim="searchText"
          name="search"
          placeholder="검색어를 입력하세요"
          v-on:keydown.enter="getSearch"
        />
        <button type="button" v-on:click="getSearch">검색</button>
        <button type="button" v-on:click="getRoute">선택된 경로 검색</button>
      </div>

      <p v-if="responseData.meta.total_count <= 0">검색결과 없음</p>
      <ul v-else>
        <li
          v-for="(search, index) in responseData.result"
          v-bind:key="index"
          :class="{ active: activeIndex.includes(index) }"
        >
          {{ index + 1 }}

          <a v-bind:href="search.place_url" target="_blank">
            {{ search.place_name }}
            <span>
              <sub>
                {{ search.category_name_detail }} /
                {{ search.road_address_name }}
              </sub>
            </span>
          </a>
          <!-- v-bind:data-x="search.x"
            v-bind:data-y="search.y" -->
          <button type="button" style="" @click="setActive(search, index)">
            선택
          </button>
        </li>
      </ul>
      <ul>
        <li v-for="(value, index) in getSavedLocation" v-bind:key="value">
          {{ value.location.lat }} : {{ value.location.lng }} / {{ index }}
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
      searchResults: [],
      getSavedLocation: [],
      activeIndex: [],
      responseData: {
        result: [],
        isLoading: false,
        meta: [],
      },
      selectedLatLng: [],
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
        httpsMode: true,
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
      const search_radius = 350;
      const search_size = 15;
      let search_page = 1;
      const search = this.searchText;

      try {
        if (search !== "") {
          let response = await axios.get(
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
          if (response.data.meta.total_count > 0) {
            response.data.documents.map((value, index) => {
              let getData = value["category_name"].split(">");
              value["category_name_detail"] =
                getData[getData.length - 1].trim();
              getCoords[index] = {
                lat: value["y"],
                lng: value["x"],
                title: value["place_name"],
                index: index + 1,
                url: value["place_url"],
              };
            });
            this.addSearchMaker(getCoords);
            this.responseData.meta = response.data.meta;
            this.responseData.result = response.data.documents;
            this.responseData.isLoading = false;
          } else {
            this.removeAddedMarkers();
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    addSearchMaker(getCoords) {
      var coords1 = getCoords;
      var coordIdx1 = 0;

      this.removeAddedMarkers();

      if (coords1.length <= 0) return;

      var getList = [];
      var PTbounds = new Tmapv2.LatLngBounds();
      // eslint-disable-next-line no-unused-vars
      var func = function () {
        //Marker 객체 생성.
        var marker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(
            coords1[coordIdx1].lat,
            coords1[coordIdx1].lng
          ), //Marker의 중심좌표 설정.
          label:
            '<a href="' +
            coords1[coordIdx1].url +
            '" target="_blank" style="position: relative; display: inline-block; z-index: 1;"><span style="display: inline-block; padding: 5px; background: white; border: 1px solid blue; border-radius: 5px; font-weight: bold; color: black;">' +
            coords1[coordIdx1].index +
            " " +
            coords1[coordIdx1].title +
            "</span></a>", //Marker의 라벨.
          title: coords1[coordIdx1].index + " " + coords1[coordIdx1].title, //Marker 타이틀.
          map: setMap, //Marker가 표시될 Map 설정.
        });

        PTbounds.extend(
          new Tmapv2.LatLng(coords1[coordIdx1].lat, coords1[coordIdx1].lng)
        );

        getList[coordIdx1] = marker;
        coordIdx1++;

        if (coordIdx1 < coords1.length) {
          setTimeout(func, 100);
        }
        setMap.fitBounds(PTbounds);
      };
      setTimeout(func, 400);
      this.searchMarkers = getList;
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
    setActive(data, index) {
      let getClickIndex = this.activeIndex.indexOf(index);
      if (getClickIndex >= 0) {
        this.$delete(this.activeIndex, getClickIndex);
        this.$delete(this.selectedLatLng, getClickIndex);
      } else {
        this.activeIndex.push(index);
        this.selectedLatLng.push({ lat: data.x, lng: data.y });
      }
    },
    getRoute() {
      let response = axios.get(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
        {
          params: {
            appKey: process.env.VUE_APP_TMAP_KEY,
            startX: setCoords[0].lng,
            startY: setCoords[0].lat,
            passList: waypoints,
            endX: setCoords[setCoords.length - 1].lng,
            endY: setCoords[setCoords.length - 1].lat,
            reqCoordType: "WGS84GEO",
            resCoordType: "EPSG3857",
            startName: "홍대입구역 8번출구",
            endName: "상수역 1번출구",
          },
          headers: {
            Authorization: KAKAO_KEY,
          },
        }
      );
      console.log(response);
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
$a-tags: "a, a:active, a:hover";
$a-tags-hover: "a:active, a:hover";
$a-tags-visited: "a:visited";

body {
  padding: 20px 20px 50px;
}
button {
  display: inline-block;
  margin: 0 0 0 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  vertical-align: middle;
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
#map_div {
  display: block;
  width: 100%;
  height: 500px;
  margin: 10px 0 0;
}
#map_div + div {
  margin: 10px 0 0;
}
ul li {
  padding: 5px 0 0 20px;
  font-size: 16px;
  #{$a-tags} {
    color: #333;
    text-decoration: none;
  }
  #{$a-tags-visited} {
    color: #888;
  }
  sub {
    display: inline-block;
    margin: 0 0 0 10px;
    font-size: 12px;
    color: #999;
    vertical-align: 2px;
  }
  button {
    vertical-align: 2px;
  }
  &.active {
    color: red;
    #{$a-tags} {
      color: red;
    }
    sub {
      color: red;
    }
  }
}
</style>
