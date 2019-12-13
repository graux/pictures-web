<template>
  <div class="box">
    <form-wrapper :validator="$v.newUser">
      <form @submit.prevent="createAccount">
        <form-group
          name="fullname"
          label="Full name">
          <b-input v-model="newUser.fullname" type="username" placeholder="Full name"
                   @input="$v.newUser.fullname.$touch()">
          </b-input>
        </form-group>
        <form-group
          name="username"
          label="Username">
          <b-input v-model="newUser.username" type="username" placeholder="Username"
                   @input="$v.newUser.username.$touch()">
          </b-input>
        </form-group>
        <form-group
          name="password"
          label="Password">
          <b-input v-model="newUser.password" type="password" placeholder="Password"
                   @input="$v.newUser.password.$touch()"
          >
          </b-input>
        </form-group>
        <form-group
          name="password_confirmation"
          label="Password Confirmation">
          <b-input v-model="newUser.password_confirmation" type="password" placeholder="Password Confirmation"
                   @input="$v.newUser.password_confirmation.$touch()"
          >
          </b-input>
        </form-group>
        <div class="field">
          <button class="button is-primary is-large is-fullwidth" @click.stop.prevent="createAccount">
            Create Account
          </button>
        </div>
        <b-message type="is-danger" has-icon size="small" :active.sync="showAccountError">
          {{ accountError }}
        </b-message>
      </form>
    </form-wrapper>
  </div>
</template>
<script>
import { required, minLength, maxLength, alphaNum, sameAs } from 'vuelidate/lib/validators'
import LoginMixin from '@/mixins/login_mixin'

export default {
  name: 'RegistrationBox',
  mixins: [LoginMixin],
  data () {
    return {
      newUser: {
        fullname: null,
        username: null,
        password: null,
        password_confirmation: null,
        role: 'user'
      },
      accountError: null,
      showAccountError: false
    }
  },
  watch: {
    accountError (newVal) {
      this.showAccountError = newVal !== null
    }
  },
  methods: {
    async createAccount () {
      this.accountError = null
      this.$v.newUser.$touch()
      if (this.$v.newUser.$invalid === false) {
        const response = await this.apiPost('users', this.newUser)
        if (response.status === 201 || response.status === 200) {
          this.$buefy.snackbar.open('User account created')
          await this.performLoginRequest({ username: this.newUser.username, password: this.newUser.password })
          this.$router.push({ name: 'pictures' })
        } else if (response.status === 409) {
          this.accountError = 'Error, the user already exists'
        } else {
          this.accountError = 'Error creating user, please check your API'
        }
      }
    }
  },
  validations: {
    newUser: {
      required,
      fullname: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(50)
      },
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(50),
        alphaNum,
        isUnique (value) {
          if (value === null || value.length < 3) { return true }
          return new Promise((resolve) => {
            this.apiHead('users/' + value).then(response => {
              resolve(response.status === 404)
            })
          })
        }
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(50)
      },
      password_confirmation: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  }
}
</script>
