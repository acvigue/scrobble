import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {Capacitor, Plugins} from "@capacitor/core"
import './quasar'
import LogRocket from "logrocket"
LogRocket.init("tefu1d/scrobble");

const {Storage, Browser} = Plugins;
const NativeApp = Plugins.App;
Vue.config.productionTip = false

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
      const scopes = "user-read-private user-read-email user-read-playback-state user-read-currently-playing";
      const url = 'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + "30ff94fb26df46dbab49759ddd32cc1c" +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri);
      Browser.open({url: url});
      Browser.addListener('browserPageLoaded', (data) => {
        console.log('Data - browserPageLoaded: '+JSON.stringify(data));
        LogRocket.captureMessage('Data - browserPageLoaded: '+JSON.stringify(data));
      });
    }
  },
  data: function() {
    return {
      authed: false
    }
  }
}).$mount('#app')

NativeApp.addListener("appUrlOpen", (data) => {

});
