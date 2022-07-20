/* eslint-disable no-unused-vars */
<template>
  <div>
    <div class="geolocationPosition">
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
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";

/* eslint-disable no-undef */
var setMap = null;
export default {
  name: "Mission",
  data() {
    return {
      loading: null,
      currentCoords: [],
      defaultMarkers: [],
      missionMarkers: [],
      marker: null,
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

      this.addMarkerAni();
      this.setMissionMarker();
    },
    addMarkerAni() {
      this.removeMarkers(this.defaultMarkers);

      let marker = new Tmapv2.Marker({
        position: this.currentCoords[0],
        draggable: true,
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
    setMissionMarker() {
      let marker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(37.570369, 126.992153),
        icon: "//tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_3.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: setMap,
      });

      marker.addListener("click", function (evt) {
        console.log(evt);
      });

      let marker1 = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(37.56335290252303, 127.00352387777271),
        icon: "//tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_4.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: setMap,
      });

      marker1.addListener("click", function () {
        marker1._marker_data.options.icon =
          "//tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_7.png";
        console.log(marker1._marker_data.options.icon);
      });

      let marker2 = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(37.570721714117965, 127.00186090818215),
        icon: "//tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_5.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: setMap,
      });

      // eslint-disable-next-line no-unused-vars
      marker2.addListener("click", function (evt) {
        console.log(this);
      });
    },
  },
  created() {},
  mounted() {
    this.$geolocation.getCurrentPosition().then(() => {
      this.loading = setInterval(this.getMyInfo, 1000);

      // if (this.setCurrentLocation) {
      // }
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

:root {
  --primary-light: #8abdff;
  --primary: #6d5dfc;
  --primary-dark: #5b0eeb;

  --white: #ffffff;
  --greyLight-1: #e4ebf5;
  --greyLight-2: #c8d0e7;
  --greyLight-3: #bec8e4;
  --greyDark: #9baacf;
}

$shadow: 0.3rem 0.3rem 0.6rem var(--greyLight-2),
  -0.2rem -0.2rem 0.5rem var(--white);
$inner-shadow: inset 0.2rem 0.2rem 0.5rem var(--greyLight-2),
  inset -0.2rem -0.2rem 0.5rem var(--white);

.geolocationPosition {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
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
</style>
