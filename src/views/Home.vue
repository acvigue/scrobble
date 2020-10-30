<template>
  <div class="row justify-center">
    <div v-if="$root.authed==false">
      <q-btn size='lg' style="background-color: #1DB954; color: white;" @click="$root.openSpotifyAuth">
        <img src="Spotify_Icon_RGB_White.png" height=35px; style="margin-right: 10px;">
        <div>Login with Spotify</div>
      </q-btn><br><br>
    </div>
    <div v-if="$root.authed==true" class="column justify-center">
      <h4>Currently Playing</h4>
      <div id="cpctx"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import axios from "axios"
import Konva from "konva"
import {Plugins} from "@capacitor/core"
const {Storage} = Plugins;
const qs = require("querystring");
export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  filters: {
  },
  data: function() {
    return {
      artist: "",
      songname: ""
    }
  },
  mounted: async function() {
    //get current playing song
    const spauth = await Storage.get({key: "spotify_auth"});
    if(spauth.value != null) {
      this.$root.spotify = JSON.parse(spauth.value);
      if(this.$root.spotify.refreshToken != "") {
        this.$root.authed = true;
        this.$root.authProvider = "spotify";
      }
    }
    if(this.$root.spotify.refreshToken != "") {
      this.$q.loading.show();
      const requestBody = {
        client_id: "30ff94fb26df46dbab49759ddd32cc1c",
        grant_type: "refresh_token",
        refresh_token: this.$root.spotify.refreshToken
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      
      axios.post("https://accounts.spotify.com/api/token", qs.stringify(requestBody), config)
      .then(async (result) => {
        this.$root.spotify.accessToken = result.data.access_token;
        this.$root.spotify.refreshToken = result.data.refresh_token;
        await Storage.set({key: "spotify_auth", value: JSON.stringify(this.$root.spotify)});

        const cps = (await axios.get("https://api.spotify.com/v1/me/player", {headers: {
          "Authorization": "Bearer " + this.$root.spotify.accessToken
        }})).data;

        //console.log(cps);
        let abarturl = "";
        let artist = "";
        let songname = "";
        try {
          abarturl = cps.item.album.images[0].url;
          artist = cps.item.album.artists[0].name;
          songname = cps.item.name.split("(")[0];
        } catch(err) {
          console.log(err);
        }
        console.log(abarturl);
        console.log(artist);
        console.log(songname);
        this.artist = artist;
        this.songname = songname;

        var stage = new Konva.Stage({
          container: 'cpctx',   // id of container <div>
          width: 300,
          height: 400
        });
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: 300,
          height: 400,
          fill: "#212121",
          cornerRadius: 10
        });
        layer.add(rect)
        var imageObj = new Image();
        imageObj.onload = function () {
          var image = new Konva.Image({
            x:150,
            y:125+25,
            image: imageObj,
            width: 250,
            height: 250,
            offset: {
              x: 125,
              y: 125
            }
          });

          // add the shape to the layer
          layer.add(image);
          layer.batchDraw();
        };

        var text = new Konva.Text({
          x: 25,
          height: 30,
          align: "center",
          y: 150 + 125 + 15,
          text: songname,
          fontSize: 30,
          fontFamily: 'Calibri',
          fill: 'white'
        });
        layer.add(text);
        text = new Konva.Text({
          x: 25,
          height: 30,
          align: "center",
          y: 150 + 125 + 15 + 35,
          text: artist,
          fontSize:25,
          fontFamily: 'Calibri',
          fill: 'white'
        });
        layer.add(text);

        imageObj.src = abarturl;

        var logoimageObj = new Image();
        logoimageObj.onload = function () {
          var image = new Konva.Image({
            x:150,
            y:360,
            image: logoimageObj,
            width: 35,
            height: 35,
            offset: {
              x: 12.5,
              y: 12.5
            }
          });

          // add the shape to the layer
          layer.add(image);
          layer.batchDraw();
        };

        logoimageObj.src = "/Spotify_Icon_RGB_White.png";

        stage.add(layer);
        layer.draw();
        this.$q.loading.hide();
      })
    }
  }
}
</script>
