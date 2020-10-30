import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {Capacitor, Plugins} from "@capacitor/core"
import './quasar'
import LogRocket from "logrocket"
const axios = require("axios").default;
var CryptoJS = require("crypto-js");
const qs = require('querystring')
//LogRocket.init("tefu1d/scrobble");

const {Storage, Browser, Toast} = Plugins;
const NativeApp = Plugins.App;
Vue.config.productionTip = false

function generateCodeChallenge(code_verifier) {
  return base64URL(CryptoJS.SHA256(code_verifier))
}
function base64URL(string) {
  return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

new Vue({
  router,
  render: h => h(App),
  methods: {
    openSpotifyAuth: function() {
      let redirect_uri = ""
      if(Capacitor.isNative) {
        redirect_uri = "scrobble://spcallback"
      } else {
        redirect_uri = "http://" + window.location.hostname + ":8080/spcallback"
      }
      const codeVerifier = generateRandomString(74);
      window.localStorage.setItem("rduri", redirect_uri);
      window.localStorage.setItem("verifier", codeVerifier);
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const scopes = "user-read-private user-read-email user-read-playback-state user-read-currently-playing";
      const url = 'https://accounts.spotify.com/authorize' +
      '?response_type=code&code_challenge_method=S256' +
      '&code_challenge=' + encodeURIComponent(codeChallenge) +
      '&client_id=' + "30ff94fb26df46dbab49759ddd32cc1c" +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri);
      if(Capacitor.isNative) {
        Browser.open({url: url});
        NativeApp.addListener("appUrlOpen", (data) => {
          //LogRocket.captureMessage('Data - appUrlOpen: '+JSON.stringify(data));
          const url = data.url.replace("scrobble://", "");
          if(url.indexOf("spcallback") != -1) {
            const spAuthCode = url.split("?code=")[1].split("#/")[0];
            this.spotify.grantCode = spAuthCode;
            Browser.close();
            this.getSpotifyTokens(codeVerifier, spAuthCode, redirect_uri);
          }
        });
      } else {
        window.location.href = url;
      }
    },
    getSpotifyTokens: function(verifier, code, redirect_uri) {
      //Authorize with Spotify!
      this.$q.loading.show();
      const requestBody = {
        client_id: "30ff94fb26df46dbab49759ddd32cc1c",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        code_verifier: verifier
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      
      axios.post("https://accounts.spotify.com/api/token", qs.stringify(requestBody), config)
      .then(async (result) => {
        console.log(result);
        Toast.show({
          text: "Connected to Spotify!"
        })
        this.spotify.accessToken = result.data.access_token;
        this.spotify.refreshToken = result.data.refresh_token;
        await Storage.set({key: "spotify_auth", value: JSON.stringify(this.spotify)});
        this.authed = true;
        this.authProvider = "spotify";
        this.$q.loading.hide();
      })
      .catch((err) => {
        console.error(err);
        Toast.show({
          text: "Couldn't authorize with Spotify."
        })
        this.$q.loading.hide();
      })
    }
  },
  data: function() {
    return {
      authed: false,
      authProvider: "",
      spotify: {
        grantCode: "",
        accessToken: "",
        refreshToken: ""
      }
    }
  },
  mounted: async function() {
    if(window.location.pathname.indexOf("spcallback") != -1 && Capacitor.isNative == false) {
      const codeVerifier = window.localStorage.getItem("verifier");
      const redirect_uri = window.localStorage.getItem("rduri");
      const authCode = window.location.href.split("code=")[1].split("#/")[0];
      this.getSpotifyTokens(codeVerifier, authCode, redirect_uri);
    }
  }
}).$mount('#app')
