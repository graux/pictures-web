<template>
  <section class="section section-home">
    <div class="container">
      <div class="columns">
        <div class="column is-half">
          <LoginBox />
        </div>
        <div class="column is-half">
          <RegistrationBox />
        </div>
      </div>
    </div>
  </section>
</template>

<script>

import LoginBox from '../components/LoginBox'
import RegistrationBox from '../components/RegistrationBox'

export default {
  name: 'home',
  components: { RegistrationBox, LoginBox },
  async created () {
    this.$ls.clear()
  }
}
</script>
