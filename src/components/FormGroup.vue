<template>
  <b-field
    :label="label"
    :custom-class="customClass"
    :type="type"
    :message="firstErrorMessage">
    <slot />
  </b-field>
</template>

<script>
import { singleErrorExtractorMixin } from 'vuelidate-error-extractor'

export default {
  name: 'FormGroup',
  extends: singleErrorExtractorMixin,
  computed: {
    type () {
      return this.hasErrors ? 'is-danger' : this.isValid ? 'is-success' : null
    },
    customClass () {
      return this.hasErrors
        ? 'has-text-danger'
        : this.isValid
          ? 'has-text-success'
          : null
    }
  }
}
</script>
