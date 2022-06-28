/* eslint-disable no-unused-vars */
<template>
  <div>
    <div
      class="geolocationPosition"
      v-bind:class="{ hidden: currentToggle === false }"
    >
      <span v-if="$geolocation.loading">Loading location...</span>
      <span v-else-if="!$geolocation.supported"
        >Geolocation API is not supported</span
      >
      <p v-else>
        <span>latitude: {{ $geolocation.coords.latitude }}</span> /
        <span>longitude: {{ $geolocation.coords.longitude }}</span> /
        <span>
          altitude:
          {{
            !$geolocation.coords.altitude ? "-" : $geolocation.coords.altitude
          }}
        </span>
        /
        <span>
          accuracy:
          {{
            !$geolocation.coords.accuracy ? "-" : $geolocation.coords.accuracy
          }}
        </span>
        /
        <span>
          altitudeAccuracy:
          {{
            !$geolocation.coords.altitudeAccuracy
              ? "-"
              : $geolocation.coords.altitudeAccuracy
          }}
        </span>
        /
        <span>
          heading:
          {{ !$geolocation.coords.heading ? "-" : $geolocation.coords.heading }}
        </span>
        /
        <span>
          speed:
          {{ !$geolocation.coords.speed ? "-" : $geolocation.coords.speed }}
        </span>
      </p>
    </div>

    <div class="contents">
      <div id="map_div" ref="printMe"></div>
      <div
        class="customArea"
        v-bind:class="{ hidden: currentToggle === false }"
      >
        <div>
          <button type="button" v-on:click.prevent="setLocalStorage">
            현재 위치 저장
          </button>
          <button type="button" v-on:click.prevent="clearLocalStorage">
            초기화
          </button>
          <button type="button" v-on:click.prevent="loadLocalStorage">
            전체 불러오기
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
          <button type="button" v-on:click="getSearch">주변 검색</button>
          <button type="button" v-on:click="resetSearch">검색 초기화</button>
          <button
            type="button"
            v-on:click="getRoute"
            v-if="selectedLatLng.length > 2"
          >
            선택된 경로 검색
          </button>
          <button
            type="button"
            v-on:click="print"
            v-if="this.responseData.result.length > 0"
          >
            이미지로
          </button>
        </div>

        <p class="routeTotalInformation">{{ routeInformation }}</p>
        <p v-if="responseData.meta.total_count <= 0">검색결과 없음</p>
        <ul v-else>
          <li
            v-for="(search, index) in searchResults"
            v-bind:key="index"
            :class="{ active: activeIndex.includes(index) }"
          >
            <div>
              <a v-bind:href="search.place_url" target="_blank">
                {{ index + 1 }}
                {{ search.place_name }}
                <span>
                  <sub>
                    {{ search.category_name_detail }}
                  </sub>
                </span>
              </a>
              <address>{{ search.road_address_name }}</address>
            </div>
            <!-- v-bind:data-x="search.x"
            v-bind:data-y="search.y" -->
            <button type="button" style="" @click="setActive(search, index)">
              선택
            </button>
          </li>
          <li v-if="this.responseData.meta.is_end === false">
            <button type="button" v-on:click="getAddSearch">더보기</button>
          </li>
        </ul>
        <ul>
          <li v-for="(value, index) in getSavedLocation" v-bind:key="index">
            {{ value.location.lat }} : {{ value.location.lng }} / {{ index }}
          </li>
        </ul>
      </div>
      <button type="button" class="showHide" v-on:click="toggle">
        접기/펴기
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
import * as htmlToImage from "html-to-image";
// eslint-disable-next-line no-unused-vars
import { saveAs } from "file-saver";
// import * as download from "downloadjs";

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
      routeInformation: "",
      drawInfoArr: [],
      resultdrawArr: [],
      routeMaker: [],
      output: null,
      currentToggle: false,
      searchPage: 1,
      searchPageSize: 15,
      searchRadius: 1000,
    };
  },
  methods: {
    getMyInfo() {
      if (this.currentCoords.length <= 0) {
        this.currentCoords = [
          new Tmapv2.LatLng(
            this.$geolocation.coords.latitude,
            this.$geolocation.coords.longitude
          ),
        ];

        setMap = new Tmapv2.Map("map_div", {
          center: this.currentCoords[0],
          zoom: 16,
          httpsMode: true,
        });
      }
      this.addMarkerAni(Tmapv2.MarkerOptions.ANIMATE_FLICKER);

      // let getImg = document.querySelectorAll("img");
      // getImg.forEach((item) => {
      //   item.setAttribute({ crossorigin: "anonymous" });
      // });
      // document.querySelectorAll("img").each(function () {
      //   var $img = this;
      //   console.log($img)
      //   $img.setAttribute({
      //     crossorigin: "anonymous",
      //   });
      // });
      // getImg.map((value, index) => {
      //   console.log(index);
      // });
    },
    addMarkerAni(aniType) {
      this.removeMarkers(this.defaultMarkers);

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
    removeMarkers(makers) {
      if (!makers || makers.length <= 0) return false;
      for (var i = 0; i < makers.length; i++) {
        makers[i].setMap(null);
      }
      makers = [];
    },
    async getSearch() {
      const KAKAO_KEY = process.env.VUE_APP_KAKAO_KEY;
      const search_radius = this.searchRadius;
      const search_size = this.searchPageSize;
      let search_page = this.searchPage;
      const search = this.searchText;
      let self = this;
      // this.activeIndex = [];

      try {
        if (search !== "") {
          await axios
            .get("https://dapi.kakao.com/v2/local/search/keyword.json", {
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
            })
            .then(function (response) {
              let getCoords = [];
              self.removeLine();
              if (response.data.meta.total_count > 0) {
                // self.selectedLatLng = [
                //   {
                //     lat: self.$geolocation.coords.latitude,
                //     lng: self.$geolocation.coords.longitude,
                //     title: "현 위치",
                //     index: 1,
                //     url: "",
                //   },
                // ];
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
                  self.searchResults.push(value);
                });
                self.addSearchMaker(getCoords, "pin");
                self.responseData.meta = response.data.meta;
                self.responseData.result = response.data.documents;
                self.responseData.isLoading = false;

                // let getResult = response.data.documents;
              } else {
                self.removeMarkers(self.searchMarkers);
              }
            })
            .catch(function (error) {
              console.error(error);
            });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getAddSearch() {
      this.searchPage += 1;
      this.getSearch();
    },
    addSearchMaker(getCoords, status) {
      var coords1 = getCoords;
      var coordIdx1 = 0;

      this.removeMarkers(this.searchMarkers);

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
          visible:
            (status === "route" && coordIdx1 > 0) || status !== "route"
              ? true
              : false,
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
    resetSearch() {
      this.searchResults = [];
      this.activeIndex = [];
      this.searchPage = 1;
      this.responseData = {
        result: [],
        isLoading: false,
        meta: [],
      };
      this.removeMarkers(this.searchMarkers);
      this.removeLine();
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
    },
    clearLocalStorage() {
      this.$localStorage.clear();
      this.getSavedLocation = [];
    },
    loadLocalStorage() {
      let keys = this.$localStorage.keys();
      keys.map((value) => {
        this.getSavedLocation = this.$localStorage.get(value);
      });
    },
    setActive(data, index) {
      let getClickIndex = this.activeIndex.indexOf(index);
      if (getClickIndex >= 0) {
        this.$delete(this.activeIndex, getClickIndex);
        this.$delete(this.selectedLatLng, getClickIndex + 1);
        this.selectedLatLng.map((value, index) => {
          value.index = index + 1;
        });
      } else {
        if (this.selectedLatLng.length <= 4) {
          this.activeIndex.push(index);
          this.selectedLatLng.push({
            lat: data.y,
            lng: data.x,
            title: data.place_name,
            index: this.selectedLatLng.length + 1,
            url: data.place_url,
          });
        } else {
          alert("최대 4곳 까지만 가능 합니다.");
        }
      }
    },
    getRoute() {
      let waypoints = "";
      //기존 그려진 라인 & 마커가 있다면 초기화
      this.removeLine();

      // this.nearSort(this.selectedLatLng);

      this.selectedLatLng.forEach((value, index) => {
        if (index === 0 || index === this.selectedLatLng.length - 1) {
          return false;
        } else {
          waypoints += value.lng + "," + value.lat;

          if (index !== this.selectedLatLng.length - 2) {
            waypoints += "_";
          }
        }
      });
      var self = this;
      axios({
        url: "/tmap/routes/pedestrian?version=1&format=json&callback=result",
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          appKey: process.env.VUE_APP_TMAP_KEY,
        },
        data: JSON.stringify({
          startX: this.selectedLatLng[0].lng,
          startY: this.selectedLatLng[0].lat,
          passList: waypoints,
          endX: this.selectedLatLng[this.selectedLatLng.length - 1].lng,
          endY: this.selectedLatLng[this.selectedLatLng.length - 1].lat,
          reqCoordType: "WGS84GEO",
          resCoordType: "EPSG3857",
          startName: "Start",
          endName: "End",
        }),
      })
        .then(function (response) {
          if (response.status === 200) {
            if (self.searchMarkers.length > 0) {
              self.removeMarkers(self.searchMarkers);
            }
            var resultData = response.data.features;

            //결과 출력
            var tDistance =
              "총 거리 : " +
              (resultData[0].properties.totalDistance / 1000).toFixed(1) +
              "km,";
            var tTime =
              " 총 시간 : " +
              (resultData[0].properties.totalTime / 60).toFixed(0) +
              "분";

            self.routeInformation = tDistance + tTime;

            for (let i in resultData) {
              //for문 [S]
              var geometry = resultData[i].geometry;
              var properties = resultData[i].properties;

              if (geometry.type == "LineString") {
                for (var j in geometry.coordinates) {
                  // 경로들의 결과값(구간)들을 포인트 객체로 변환
                  var latlng = new Tmapv2.Point(
                    geometry.coordinates[j][0],
                    geometry.coordinates[j][1]
                  );
                  // 포인트 객체를 받아 좌표값으로 변환
                  let convertPoint =
                    new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlng);
                  // 포인트객체의 정보로 좌표값 변환 객체로 저장
                  var convertChange = new Tmapv2.LatLng(
                    convertPoint._lat,
                    convertPoint._lng
                  );
                  // 배열에 담기
                  self.drawInfoArr.push(convertChange);
                }
              } else {
                let markerImg = "";
                let pType = "";
                let size;
                let description = "";

                if (properties.pointType == "SP") {
                  //출발지 마커
                  markerImg =
                    "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
                  pType = "S";
                  size = new Tmapv2.Size(24, 38);
                  description = self.selectedLatLng[0].place_name;
                }
                // else if (properties.pointType == "EP") {
                //   //도착지 마커
                //   markerImg =
                //     "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
                //   pType = "E";
                //   size = new Tmapv2.Size(24, 38);
                //   description =
                //     self.selectedLatLng[self.selectedLatLng.length - 1]
                //       .place_name;
                // }
                else {
                  //각 포인트 마커
                  markerImg = "https://topopen.tmap.co.kr/imgs/point.png";
                  pType = "P";
                  size = new Tmapv2.Size(12, 12);
                  description = properties.description;
                }

                // 경로들의 결과값들을 포인트 객체로 변환
                var latlon = new Tmapv2.Point(
                  geometry.coordinates[0],
                  geometry.coordinates[1]
                );

                // 포인트 객체를 받아 좌표값으로 다시 변환
                let convertPoint =
                  new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlon);

                var routeInfoObj = {
                  markerImage: markerImg,
                  lng: convertPoint._lng,
                  lat: convertPoint._lat,
                  pointType: pType,
                };

                // Marker 추가
                // eslint-disable-next-line no-unused-vars
                var marker_p = new Tmapv2.Marker({
                  position: new Tmapv2.LatLng(
                    routeInfoObj.lat,
                    routeInfoObj.lng
                  ),
                  icon: routeInfoObj.markerImage,
                  iconSize: size,
                  title: description,
                  map: setMap,
                });
                self.routeMaker.push(marker_p);
              }
            } //for문 [E]
            self.drawLine(self.drawInfoArr);
            self.addSearchMaker(self.selectedLatLng, "route");
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    drawLine(arrPoint) {
      let polyline_;

      polyline_ = new Tmapv2.Polyline({
        path: arrPoint,
        strokeColor: "#ff0000",
        strokeWeight: 4,
        map: setMap,
      });
      this.resultdrawArr.push(polyline_);
    },
    removeLine() {
      if (this.routeMaker.length > 0) {
        this.removeMarkers(this.routeMaker);
      }
      if (this.resultdrawArr.length > 0) {
        for (let i in this.resultdrawArr) {
          this.resultdrawArr[i].setMap(null);
        }
        this.resultdrawArr = [];
      }
      this.drawInfoArr = [];
    },
    async print() {
      let getWidth = this.getWidth();
      let getHeight = this.getHeight();

      await htmlToImage
        .toBlob(document.querySelector("#map_div"), {
          pixelRatio: 1,
          cacheBust: true,
          width: getWidth,
          height: getHeight,
        })
        .then(function (blob) {
          let getDate = dayjs().format("YYYYMMDDHHmm");
          // let img = new Image();
          // img.src = dataUrl;
          // document.body.appendChild(img);
          // download(dataUrl, getDate + ".png");
          // console.log(dataUrl);
          // this.output = dataUrl;
          if (window.saveAs) {
            window.saveAs(blob, getDate + ".png");
          } else {
            setTimeout(() => {
              FileSaver.saveAs(blob, getDate + ".png");
            }, 1000);
          }
          // let img = new Image();
          // img.src = blob;
          // document.body.appendChild(img);
          // document.body.appendChild(blob);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    // nearSort(array) {
    //   let currentLat = this.$geolocation.coords.latitude;
    //   let currentLng = this.$geolocation.coords.longitude;
    //   let getCurrentNearArray = [];
    //   array.map((value) => {
    //     let currentDistance = this.getDistanceFromLatLonInKm(
    //       currentLat,
    //       currentLng,
    //       value.lat,
    //       value.lng
    //     );
    //     getCurrentNearArray.push(currentDistance);
    //   });
    //   for (let i = 0; i < getCurrentNearArray.length; i++) {
    //     let swap;
    //     for (let j = 0; j < getCurrentNearArray.length - 1 - i; j++) {
    //       if (getCurrentNearArray[j] > getCurrentNearArray[j + 1]) {
    //         swap = array[j];
    //         array[j] = array[j + 1];
    //         array[j + 1] = swap;
    //       }
    //     }
    //     if (!swap) {
    //       break;
    //     }
    //   }
    //   array.map((value, index) => {
    //     value.index = index + 1;
    //   });
    //   return array;
    //   let distanceArray = [array.length - 1];
    //   for (let i = 0; i < array.length; i++) {
    //     distanceArray[i] = [array.length - 1];
    //     for (let j = 0; j < array.length; j++) {
    //       distanceArray[i][j] = this.getDistanceFromLatLonInKm(
    //         array[i].lat,
    //         array[i].lng,
    //         array[j].lat,
    //         array[j].lng
    //       );
    //     }
    //   }
    //   console.log(distanceArray);
    // },
    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
      var dLon = this.deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    },
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    toggle() {
      this.currentToggle = !this.currentToggle;
    },
    getWidth() {
      let xWidth = null;
      if (window.screen != null) xWidth = window.screen.availWidth;
      if (window.innerWidth != null) xWidth = window.innerWidth;
      if (document.body != null) xWidth = document.body.clientWidth;
      return xWidth;
    },
    getHeight() {
      let xHeight = null;
      if (window.screen != null) xHeight = window.screen.availHeight;
      if (window.innerHeight != null) xHeight = window.innerHeight;
      if (document.body != null) xHeight = document.body.clientHeight;
      return xHeight;
    },
  },
  created() {},
  mounted() {
    this.$geolocation.getCurrentPosition().then(() => {
      this.getMyInfo();

      this.selectedLatLng.push({
        lat: this.$geolocation.coords.latitude,
        lng: this.$geolocation.coords.longitude,
        title: "현 위치",
        index: 1,
        url: "",
      });
    });
  },
  updated() {},
};
</script>

<style lang="scss">
$a-tags: "a, a:active, a:hover";
$a-tags-hover: "a:active, a:hover";
$a-tags-visited: "a:visited";
$breakpoint-mobile: 320px;
$breakpoint-tablet: 768px;
$breakpoint-pc: 1024px;
$retina: "(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)";

body {
  padding: 0;
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
  width: calc(100% - 40px);
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
  height: 100vh;
  margin: 0;
  @media (max-width: $breakpoint-pc) and #{$retina} {
    height: -webkit-fill-available;
    height: fill-available;
  }
}
#map_div + div {
  margin: 10px 0 0;
}
ul li {
  display: flex;
  flex-flow: row wrap;
  padding: 10px 0 0 0;
  font-size: 14px;
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
    font-size: 10px;
    color: #999;
    vertical-align: 2px;
  }
  address {
    display: block;
    margin-top: 5px;
    font-size: 10px;
    color: #7e8795;
  }
  button {
    vertical-align: 2px;
  }
  &.active {
    font-size: 14px;
    color: red;
    #{$a-tags} {
      color: red;
    }
    sub {
      color: red;
    }
  }
}
.routeTotalInformation {
  margin: 10px 0;
}
.contents {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  .showHide {
    position: absolute;
    top: 88px;
    display: block;
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    background: #fff
      url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 1000 1000' enable-background='new 0 0 1000 1000' xml:space='preserve'%3E%3Cmetadata%3E Svg Vector Icons : http://www.onlinewebfonts.com/icon %3C/metadata%3E%3Cg%3E%3Cpath d='M500,12.9C229.4,12.9,10,231,10,500c0,269,219.4,487.1,490,487.1c270.6,0,490-218.1,490-487.1C990,231,770.6,12.9,500,12.9z M499.9,923.8c-233.8,0-423.3-189.5-423.3-423.3c0-233.8,189.5-423.3,423.3-423.3s423.3,189.5,423.3,423.3C923.2,734.3,733.7,923.8,499.9,923.8z'/%3E%3Cpath d='M245,497.7c0,34.1,27.6,61.7,61.7,61.7c34.1,0,61.7-27.6,61.7-61.7c0-34.1-27.6-61.7-61.7-61.7C272.6,436,245,463.6,245,497.7L245,497.7L245,497.7z'/%3E%3Cpath d='M451.6,497.7c0,34.1,27.6,61.7,61.7,61.7c34.1,0,61.7-27.6,61.7-61.7c0,0,0-0.1,0-0.1c0-34.1-27.6-61.7-61.7-61.7C479.2,436,451.6,463.6,451.6,497.7L451.6,497.7L451.6,497.7z'/%3E%3Cpath d='M638.1,497.7c0,34.1,27.6,61.7,61.7,61.7c34.1,0,61.7-27.6,61.7-61.7c0,0,0-0.1,0-0.1c0-34.1-27.6-61.7-61.7-61.7C665.8,436,638.1,463.6,638.1,497.7L638.1,497.7z'/%3E%3C/g%3E%3C/svg%3E")
      no-repeat 50% 50%;
    background-size: 30px;
    border-radius: 50%;
    text-indent: -9999em;
    border: 0;
  }
  .customArea.hidden + .showHide {
    left: 0;
  }
  .customArea + .showHide {
    right: 20px;
  }
}
.contents > div {
  width: 40%;
  background: rgba(255, 255, 255, 0.8);
  &.customArea {
    position: absolute;
    top: 68px;
    left: 0;
    width: 100vw;
    height: calc(
      calc(calc(90vh - env(safe-area-inset-top)) - env(safe-area-inset-bottom)) -
        98px
    );
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
    &.hidden {
      left: -100vw;
    }
  }
}
.contents > div:first-of-type {
  width: 100%;
}
.geolocationPosition {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 68px;
  padding: 0 20px;
  background: rgba($color: #999, $alpha: 0.7);
  font-size: 14px;
  line-height: 16px;
  box-sizing: border-box;
  z-index: 1;
  overflow-y: auto;
  &.hidden {
    top: -68px;
  }
  span {
    font-size: 14px;
    line-height: 16px;
  }
}
</style>
