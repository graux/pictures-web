export default {
  methods: {
    async performLoginRequest (credentials) {
      const response = await this.apiPost('users/login', credentials)
      if (response.status === 200) {
        this.$ls.set('token', response.data.token)
        this.$ls.set('user_id', response.data.user_id)
        this.$ls.set('roles', response.data.roles)
        this.$eventHub.$emit('login')
        return true
      } else {
        return false
      }
    }
  }
}
