<template>
  <section class="section section-picture-details">
    <div class="columns is-centered">
      <div class="column is-9">
        <div v-if="userDetails">
          <figure class="image">
            <img
              v-if="userDetails.avatar && userDetails.avatar.highres_url"
              :alt="userDetails.fullname"
              :src="getAbsoluteURL(userDetails.avatar.highres_url)"
              class="is-rounded profile-image"
            >
            <img
              v-else
              :alt="userDetails.fullname"
              src="/gopher.png"
              class="is-rounded profile-image"
            >
            <b-upload
              v-if="isAdmin || isOwner"
              class="upload-wrapper"
              @input="avatarUpload"
            >
              <a class="button is-info is-medium">
                <b-icon icon="cloud-upload-alt" />
                <span>Upload Avatar</span>
              </a>
            </b-upload>
          </figure>
          <div class="box">
            <template v-if="editMode === true">
              <div class="field">
                <b-field label="Full Name">
                  <b-input v-model="editUser.fullname" />
                </b-field>
                <b-field label="Username">
                  <b-input v-model="editUser.username" />
                </b-field>
                <hr class="hr" />
                <div class="buttons is-right">
                  <BButton icon-left="undo" type="is-warning" @click="editMode = false">Undo Changes</BButton>
                  <BButton icon-left="edit" type="is-success" @click="updateUser">Update User</BButton>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="field">
                <h1 class="title">{{ userDetails.fullname }}</h1>
              </div>
              <div class="field">
                <b-field grouped group-multiline class="is-centered">
                  <div class="control">
                    <b-tag
                      v-for="role in userRoles"
                      :key="'role_'+role"
                      type="is-info"
                      size="medium"
                      class="is-uppercase"
                    >
                      {{ role }}
                    </b-tag>
                  </div>
                  <div class="control">
                    <b-taglist attached>
                      <b-tag type="is-dark" class="is-uppercase">Username</b-tag>
                      <b-tag type="is-info">{{ userDetails.username }}</b-tag>
                    </b-taglist>
                  </div>
                  <div class="control">
                    <b-taglist attached>
                      <b-tag type="is-dark" class="is-uppercase">Registered</b-tag>
                      <b-tag type="is-info">{{ formatDate(userDetails.registered) }}</b-tag>
                    </b-taglist>
                  </div>
                </b-field>
              </div>
              <template v-if="isOwner || isAdmin">
                <hr class="hr" />
                <div class="buttons is-right">
                  <BButton v-if="isAdmin" icon-left="trash" type="is-danger" @click="deleteUser">Delete User</BButton>
                  <BButton icon-left="edit" type="is-info" @click="editMode = true">Edit User</BButton>
                </div>
              </template>
            </template>
          </div>
        </div>
        <b-loading :is-full-page="true" :active.sync="isLoading" />
      </div>
    </div>
  </section>
</template>
<script>
import moment from 'moment'

export default {
  name: 'UserDetails',
  data () {
    return {
      editMode: false,
      isLoading: true,
      userDetails: null,
      userID: null,
      profileUserID: null,
      userRoles: [],
      editUser: {
        fullname: null,
        username: null
      },
      newAvatar: null
    }
  },
  computed: {
    isAdmin () {
      return this.$ls.get('roles').includes('admin')
    },
    isOwner () {
      return this.profileUserID === this.userID
    }
  },
  created () {
    this.profileUserID = parseInt(this.$route.params.id)
    this.userID = parseInt(this.$ls.get('user_id'))
    this.loadUserDetails()
  },
  watch: {
    userDetails (newVal) {
      if (newVal.hasOwnProperty('roles')) {
        this.userRoles = newVal.roles
      } else if (newVal.hasOwnProperty('role')) {
        this.userRoles = [newVal.role]
      }
    }
  },
  methods: {
    async loadUserDetails () {
      this.isLoading = true
      const response = await this.apiGet('users/' + this.$route.params.id)
      if (response.status === 200) {
        this.userDetails = response.data
        this.editUser = JSON.parse(JSON.stringify(this.userDetails))
      } else {
        this.$buefy.snackbar.open('Cannot load User Details', { type: 'is-danger' })
      }
      this.isLoading = false
    },
    formatDate (date) {
      return moment(date).format('D MMM YYYY')
    },
    async updateUser () {
      this.isLoading = true
      this.userDetails.username = this.editUser.username
      this.userDetails.fullname = this.editUser.fullname
      if (this.userDetails.hasOwnProperty('roles')) {
        this.userDetails.roles = this.editUser.roles
      } else if (this.userDetails.hasOwnProperty('role')) {
        this.userDetails.role = this.editUser.role
      }
      const response = await this.apiPut('users/' + this.profileUserID, this.userDetails)
      if (response.status === 200 || response.status === 204) {
        this.$buefy.snackbar.open({ message: 'User Updated', type: 'is-success' })
        this.editMode = false
        this.loadUserDetails()
        return
      } else {
        this.$buefy.snackbar.open({ message: 'Error updating User profile', type: 'is-danger' })
      }
      this.isLoading = false
    },
    async avatarUpload (avatarFile) {
      this.isLoading = true
      if (avatarFile && avatarFile.size > 0 && (avatarFile.type.includes('jpeg') || avatarFile.type.includes('png'))) {
        if (avatarFile.size < (1024 * 1024 * 2)) {
          let response = await this.apiPost('images?type=avatar', avatarFile)
          if (response.status === 201 && response.headers.location) {
            const tokens = response.headers.location.split('/')
            const imageID = parseInt(tokens[tokens.length - 1])
            this.userDetails.avatar = { image_id: imageID }
            this.userDetails.image_id = imageID
            response = await this.apiPut('users/' + this.profileUserID, this.userDetails)
            if (response.status === 200 || response.status === 204) {
              this.$buefy.snackbar.open({ message: 'Avatar updated', type: 'is-success' })
              this.loadUserDetails()
              return
            } else {
              this.$buefy.snackbar.open({ message: 'Error updating User profile with new avatar', type: 'is-danger' })
            }
          } else {
            this.$buefy.snackbar.open({ message: 'Server error processing Avatar Image', type: 'is-danger' })
          }
        } else {
          this.$buefy.snackbar.open({ message: 'The maximum image size is 2MiB', type: 'is-danger' })
        }
      } else {
        this.$buefy.snackbar.open({ message: 'Please upload a valid JPEG or PNG image', type: 'is-danger' })
      }
      this.isLoading = false
    },
    deleteUser () {
      this.$buefy.dialog.confirm({
        title: 'Deleting User',
        message: 'Are you sure you want to <b>delete</b> this user? This action cannot be undone.',
        confirmText: 'Delete User',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: this.performDeleteUser
      })
    },
    async performDeleteUser () {
      this.isLoading = true
      const response = await this.apiDelete('users/' + this.profileUserID)
      if (response.status === 200 || response.status === 204) {
        this.$buefy.snackbar.open({ message: 'User deleted!', type: 'is-success' })
        this.$router.push({ name: 'pictures' })
      } else {
        this.$buefy.snackbar.open({ message: 'Error deleting User!', type: 'is-danger' })
      }
    }
  }
}
</script>
