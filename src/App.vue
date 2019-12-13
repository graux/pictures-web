<template>
  <div id="app">
    <HeaderBar />
    <div class="columns is-fullheight">
      <div class="column is-fullheight">
        <router-view />
      </div>
      <div v-if="isLoggedIn()" class="column is-3 has-background-white is-fullheight">
        <SidebarChat />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;

    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
<script>
import HeaderBar from './components/HeaderBar'
import SidebarChat from './components/SidebarChat'

export default {
  components: { SidebarChat, HeaderBar }
}
</script>
