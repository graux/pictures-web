<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Upload Picture</p>
    </header>
    <div class="modal-card-body">
      <transition name="fade">
        <b-upload
          v-if="picture.image === null"
          v-model="uploadPictureFile" drag-drop
          :key="'uploadPicture'"
        >
          <section class="section">
            <div class="content has-text-centered">
              <p>
                <b-icon
                  icon="upload"
                  size="is-large">
                </b-icon>
              </p>
              <p>Drop your JPEG picture here</p>
            </div>
          </section>
        </b-upload>
        <div
          v-else
          :key="'detailsPicture'"
          class="message"
        >
          <form-wrapper :validator="$v.picture">
            <form @submit.prevent="createPicture">
              <form-group
                name="title"
                label="Picture Title">
                <b-input v-model="picture.title" type="text" placeholder="Picture Title"
                         @input="$v.picture.title.$touch()">
                </b-input>
              </form-group>
              <form-group
                name="description"
                label="Description">
                <b-input v-model="picture.description" type="textarea" placeholder="Picture Description"
                         @input="$v.picture.description.$touch()">
                </b-input>
              </form-group>
              <div class="field">
                <button class="button is-primary is-large is-fullwidth" @click.stop.prevent="createPicture">
                  Create Picture
                </button>
              </div>
            </form>
          </form-wrapper>
        </div>
      </transition>
      <b-message type="is-danger" has-icon size="small" :active.sync="pictureError">
        {{ pictureErrorMessage }}
      </b-message>
    </div>
  </div>
</template>
<script>
import { minLength, maxLength, required } from 'vuelidate/lib/validators'

export default {
  name: 'UploadPictureCard',
  data () {
    return {
      uploadPictureFile: null,
      picture: {
        image: null,
        image_id: null,
        title: null,
        description: null
      },
      pictureError: false,
      pictureErrorMessage: null
    }
  },
  watch: {
    pictureErrorMessage (errMsg) {
      this.pictureError = errMsg !== null
    },
    uploadPictureFile (file) {
      this.pictureErrorMessage = null
      if (file && file.size > 0 && file.type.includes('jpeg')) {
        if (file.size < (1024 * 1024 * 2)) {
          this.picture.image = file
        } else {
          this.pictureErrorMessage = 'The maximum image size is 2MiB'
        }
      } else {
        this.pictureErrorMessage = 'Please upload a valid JPEG image'
      }
    }
  },
  methods: {
    async createPicture () {
      this.$v.picture.$touch()
      if (this.$v.picture.$invalid === false) {
        let response = await this.apiPost('images?type=picture', this.picture.image)
        if (response.status === 201 && response.headers.location) {
          const tokens = response.headers.location.split('/')
          const imageID = parseInt(tokens[tokens.length - 1])
          this.picture.image = null
          this.picture.image_id = imageID
          this.picture.user_id = parseInt(this.$ls.get('user_id'))
          response = await this.apiPost('pictures', this.picture)
          if (response.status === 201) {
            this.$eventHub.$emit('picture-created')
          } else {
            this.pictureErrorMessage = 'Error creating the picture'
          }
        } else {
          this.pictureErrorMessage = 'Error creating the image'
        }
      }
    }
  },
  validations: {
    picture: {
      required,
      title: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(100)
      },
      description: {
        minLength: minLength(0),
        maxLength: maxLength(2000)
      }
    }
  }
}
</script>
