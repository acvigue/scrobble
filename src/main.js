import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {Capacitor, Plugins} from "@capacitor/core"
import './quasar'
import LogRocket from "logrocket"
const axios = require("axios").default;
var CryptoJS = require("crypto-js");
const qs = require('querystring')
LogRocket.init("tefu1d/scrobble");

const {Storage, Browser} = Plugins;
const NativeApp = Plugins.App;
Vue.config.productionTip = false

function generateCodeChallenge(code_verifier) {
  return code_challenge = base64URL(CryptoJS.SHA256(code_verifier))
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
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const scopes = "user-read-private user-read-email user-read-playback-state user-read-currently-playing";
      const url = 'https://accounts.spotify.com/authorize' +
      '?response_type=code&code_challenge_method=S256' +
      '&code_challenge=' + encodeURIComponent(codeChallenge) +
      '&client_id=' + "30ff94fb26df46dbab49759ddd32cc1c" +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri);
      Browser.open({url: url});
      NativeApp.addListener("appUrlOpen", (data) => {
        LogRocket.captureMessage('Data - appUrlOpen: '+JSON.stringify(data));
        const url = data.url.replace("scrobble://", "");
        if(url.indexOf("spcallback") != -1) {
          const spAuthCode = url.split("?code=")[1];
          this.spotify.grantCode = spAuthCode;
          Browser.close();
          this.$q.loading.show();

          //Authorize with Spotify!
          const requestBody = {
            client_id: "30ff94fb26df46dbab49759ddd32cc1c",
            grant_type: "authorization_code",
            code: spAuthCode,
            redirect_uri: redirect_uri,
            code_verifier: codeVerifier
          }
          
          const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
          
          axios.post("https://accounts.spotify.com/api/token", qs.stringify(requestBody), config)
          .then((result) => {
            // Do somthing
            LogRocket.captureMessage('Data - spresult: '+JSON.stringify(result));
            this.$q.loading.hide();
          })
          .catch((err) => {
            // Do somthing
            LogRocket.captureMessage('Data - sperror: '+JSON.stringify(err));
            this.$q.loading.hide();
          })
        }
      });
    }
  },
  data: function() {
    return {
      authed: false,
      spotify: {
        grantCode: ""
      }
    }
  }
}).$mount('#app')
