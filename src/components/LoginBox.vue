<template>
  <div class="box">
    <form-wrapper :validator="$v.credentials">
      <form @submit.prevent="performLogin">
        <form-group
          name="username"
          label="Username">
          <b-input v-model="credentials.username" type="username" placeholder="Username"
                   @input="$v.credentials.username.$touch()">
          </b-input>
        </form-group>
        <form-group
          name="password"
          label="Password">
          <b-input v-model="credentials.password" type="password" placeholder="Password"
                   @input="$v.credentials.password.$touch()"
          >
          </b-input>
        </form-group>
        <div class="field">
          <button class="button is-primary is-large is-fullwidth" @click.stop.prevent="performLogin">
            Login
          </button>
        </div>
        <b-message type="is-danger" has-icon size="small" :active.sync="loginError">
          The username and/or password was not correct
        </b-message>
      </form>
    </form-wrapper>
  </div>
</template>
<script>
import { required, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators'
import LoginMixin from '@/mixins/login_mixin'

export default {
  name: 'LoginBox',
  mixins: [LoginMixin],
  data () {
    return {
      credentials: {
        username: null,
        password: null
      },
      loginError: false
    }
  },
  methods: {
    async performLogin () {
      this.$v.credentials.$touch()
      if (this.$v.credentials.$invalid === false) {
        this.loginError = false
        if (await this.performLoginRequest(this.credentials)) {
          this.$router.push({ name: 'pictures' })
        } else {
          this.loginError = true
        }
      }
    }
  },
  validations: {
    credentials: {
      required,
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(50),
        alphaNum
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(50)
      }
    }
  }
}
</script>
