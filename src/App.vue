<template>
  <q-layout>
    <q-header elevated class="bg-black">
        <q-toolbar>
          <q-toolbar-title style="text-align:center;">Scrobble</q-toolbar-title>
        </q-toolbar>
      </q-header>
    <q-page-container>
      <router-view style="padding: 12pt;"/>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'LayoutDefault',
}
</script>

<style>
</style>
