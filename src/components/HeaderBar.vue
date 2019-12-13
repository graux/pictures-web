<template>
  <nav
    v-if="hasUser"
    class="navbar docs-navbar is-spaced has-shadow"
  >
    <div class="navbar-menu">
      <div v-if="$route.name !== 'user'" class="navbar-item">
        <b-button
          type="is-info"
          icon-left="user-circle"
          @click="$router.push({name: 'user', params: {id: $ls.get('user_id')}})"
        >
          Profile
        </b-button>
      </div>
      <div v-if="$route.name !== 'pictures'" class="navbar-item">
        <b-button
          type="is-info"
          icon-left="images"
          @click="$router.push({name: 'pictures' })"
        >
          Images
        </b-button>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <b-button type="is-info" @click="showUploadModal = true" icon-left="cloud-upload-alt">
            Upload
          </b-button>
        </div>
        <div class="navbar-item">
          <b-button type="is-danger" @click="logOut" icon-left="sign-out-alt">
            Log Out
          </b-button>
        </div>
      </div>
    </div>
    <b-modal :active.sync="showUploadModal" has-modal-card trap-focus aria-role="dialog" aria-modal>
      <UploadPictureCard />
    </b-modal>
  </nav>
</template>
<script>
import UploadPictureCard from './UploadPictureCard'

export default {
  name: 'HeaderBar',
  components: { UploadPictureCard },
  data () {
    return {
      hasUser: false,
      showUploadModal: false
    }
  },
  mounted () {
    this.$ls.on('token', this.tokenUpdate)
    this.tokenUpdate()
    this.$eventHub.$on('picture-created', this.onPictureCreated)
    this.$eventHub.$on('login', this.tokenUpdate)
  },
  methods: {
    tokenUpdate () {
      const newToken = this.$ls.get('token')
      this.hasUser = newToken && newToken.length > 0
    },
    logOut () {
      this.$ls.clear()
      this.hasUser = false
      this.$router.push({ name: 'home' })
    },
    onPictureCreated () {
      this.showUploadModal = false
      this.$buefy.snackbar.open('New Picture created successfully')
    }
  }
}
</script>
