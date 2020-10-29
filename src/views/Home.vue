<template>
  <div class="row justify-center">
    <div v-if="$root.authed==false">
      <q-btn size='lg' style="background-color: #1DB954; color: white;" @click="$root.openSpotifyAuth">
        <img src="Spotify_Icon_RGB_White.png" height=35px; style="margin-right: 10px;">
        <div>Login with Spotify</div>
      </q-btn>
    </div>
    <div v-if="$root.authed==true">
      authed with {{$root.musicProvider}}
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script>
