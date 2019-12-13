<template>
  <section class="section section-pictures">
    <b-message
      v-if="pictures && pictures.length === 0"
      title="No Pictures" type="is-info" has-icon>
      There are no Pictures created yet
    </b-message>
    <div class="columns is-multiline is-centered">
      <div
        v-for="pic in pictures"
        :key="'pic_'+pic.picture_id"
        class="column is-4-mobile is-3-desktop"
      >
        <router-link :to="{name: 'picture', params: { id: pic.picture_id }}">
          <figure class="image is-16by9" style="background: #999999">
            <img :alt="pic.title" :src="getAbsoluteURL(pic.image.lowres_url)" />
          </figure>
        </router-link>
      </div>
    </div>
    <b-loading :is-full-page="true" :active.sync="isLoading" />
  </section>
</template>
<script>
export default {
  name: 'Pictures',
  data () {
    return {
      isLoading: true,
      pictures: null
    }
  },
  created () {
    this.loadPictures()
    this.$eventHub.$on('picture-created', this.onPictureCreated)
  },
  methods: {
    async loadPictures () {
      this.isLoading = true
      const response = await this.apiGet('pictures')
      if (response.status === 200) {
        this.pictures = response.data
      } else if (response.status === 204) {
        this.pictures = []
      } else {
        this.$router.push({ name: 'home' })
      }
      this.isLoading = false
    },
    onPictureCreated () {
      this.loadPictures()
    }
  }
}
</script>
