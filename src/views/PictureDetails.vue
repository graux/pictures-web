<template>
  <section class="section section-picture-details">
    <div v-if="pictureDetails">
      <div class="box">
        <figure class="image is-16by9">
          <img :alt="pictureDetails.title" :src="getAbsoluteURL(pictureDetails.image.highres_url)" />
          <div class="tags has-addons image-tags is-marginless">
            <span class="tag is-dark is-medium"><b-icon icon="comments" /></span>
            <span class="tag is-info is-medium">{{ pictureDetails.num_comments }}</span>
            <span class="tag is-dark is-medium"><b-icon icon="thumbs-up" /></span>
            <span class="tag is-info is-medium">{{ pictureDetails.num_likes }}</span>
          </div>
          <div class="buttons image-buttons">
            <b-button
              v-if="userLikesPic"
              :type="'is-danger'" class="is-uppercase" icon-left="times-circle"
              @click="unLikePicture"
            >
              Stop Liking
            </b-button>
            <b-button
              v-else
              :type="'is-success'" class="is-uppercase" icon-left="thumbs-up"
              @click="likePicture"
            >
              Like Picture
            </b-button>
          </div>
        </figure>
        <br />
        <h1 class="title">{{ pictureDetails.title }}</h1>
        <p class="is-size-4">{{ pictureDetails.description }}</p>
        <p v-if="pictureDetails.user">
          Created by
          <router-link :to="{name: 'user', params: {id: pictureDetails.user_id}}">
            {{ pictureDetails.user.fullname }}
          </router-link>
          @
          {{ formatDate(pictureDetails.created) }}
        </p>
        <p v-else class="is-italic has-text-grey"> -- No user info --</p>
        <hr class="hr" />
        <h2 class="title">User Comments</h2>
        <b-message type="is-danger" has-icon size="small" :active="pictureComments && pictureComments.length === 0">
          There are no comments for this picture yet
        </b-message>
        <div
          v-if="pictureComments && pictureComments.length > 0"
          class="comments-wrapper">
          <div
            v-for="comment in  pictureComments"
            :key="'comment_id_'+comment.comment_id"
            class="media"
          >
            <div class="media-left">
              <router-link :to="{name: 'user', params: {id: comment.user_id}}">
                <figure
                  class="image avatar is-64x64"
                >
                  <img
                    v-if="comment.user && comment.user.avatar"
                    :alt="comment.user.fullname"
                    :src="getAbsoluteURL(comment.user.avatar.thumb_url)"
                  />
                  <img
                    v-else
                    alt="Missing Avatar"
                    src="/gopher.png"
                  />
                </figure>
              </router-link>
            </div>
            <div class="media-content is-size-5">
              <p>
                {{ comment.comment }}
              </p>
              <p class="is-size-7">
                <span v-if="comment.user">{{ comment.user.fullname }} @ </span><span class="has-text-info">{{ formatDate(comment.created) }}</span>
              </p>
            </div>
          </div>
        </div>
        <form-wrapper :validator="$v.newComment">
          <form @submit.prevent="createComment">
            <form-group
              name="comment"
              label="Post new comment">
              <b-input v-model="newComment.comment" type="textarea" placeholder="You comment for this picture..."
                       @input="$v.newComment.comment.$touch()">
              </b-input>
            </form-group>
            <div class="field">
              <b-button type="is-primary" size="is-large" @click.stop.prevent="postComment" icon-left="comment">
                Post Comment
              </b-button>
            </div>
            <b-message type="is-danger" has-icon size="small" :active.sync="commentError">
              Could not create the comment
            </b-message>
          </form>
        </form-wrapper>
      </div>
    </div>
    <b-loading :is-full-page="true" :active.sync="isLoading" />
  </section>
</template>
<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import moment from 'moment'

export default {
  name: 'PictureDetails',
  data () {
    return {
      isLoading: true,
      pictureDetails: null,
      pictureComments: null,
      pictureLikes: null,
      userLikesPic: false,
      userID: 0,
      commentError: false,
      newComment: {
        picture_id: null,
        user_id: null,
        comment: null
      }
    }
  },
  created () {
    this.userID = parseInt(this.$ls.get('user_id'))
    this.loadPictureDetails()
    this.$eventHub.$on('picture-created', this.goToPictures)
  },
  methods: {
    formatDate (date) {
      return moment(date).format('dddd D MMM YYYY HH:mm')
    },
    goToPictures () {
      this.$router.push({ name: 'pictures' })
    },
    async loadPictureDetails () {
      this.isLoading = true
      const response = await this.apiGet('pictures/' + this.$route.params.id)
      if (response.status === 200) {
        this.pictureDetails = response.data
        await this.loadPictureComments()
        await this.loadPictureLikes()
      } else {
        this.$buefy.snackbar.open('Cannot load Picture Details', { type: 'is-danger' })
        this.goToPictures()
      }
      this.isLoading = false
    },
    async loadPictureComments () {
      const response = await this.apiGet('pictures/' + this.$route.params.id + '/comments')
      if (response.status === 200) {
        this.pictureComments = response.data
      } else {
        this.pictureComments = []
      }
    },
    async loadPictureLikes () {
      const response = await this.apiGet('pictures/' + this.$route.params.id + '/likes')
      if (response.status === 200) {
        this.pictureLikes = response.data
      } else {
        this.pictureLikes = []
      }
      this.userLikesPic = this.pictureLikes.filter(pl => pl.user_id === this.userID).length > 0
    },
    async unLikePicture () {
      const response = await this.apiDelete('pictures/' + this.$route.params.id + '/likes/' + this.userID)
      if (response.status === 204) {
        this.loadPictureDetails()
      } else {
        this.$buefy.toast.open({
          duration: 5000,
          message: `Error updating Picture likes`,
          position: 'is-bottom',
          type: 'is-danger'
        })
      }
    },
    async likePicture () {
      const response = await this.apiPost('pictures/' + this.$route.params.id + '/likes/' + this.userID)
      if (response.status === 201) {
        this.loadPictureDetails()
        this.$buefy.snackbar.open('Picture Liked!')
      } else {
        this.$buefy.toast.open({
          duration: 5000,
          message: `Error updating Picture likes`,
          position: 'is-bottom',
          type: 'is-danger'
        })
      }
    },
    async postComment () {
      this.newComment.user_id = this.userID
      this.newComment.picture_id = parseInt(this.$route.params.id)
      this.$v.newComment.$touch()
      if (this.$v.newComment.$invalid === false) {
        const response = await this.apiPost('pictures/' + this.$route.params.id + '/comments', this.newComment)
        if (response.status === 201) {
          this.loadPictureDetails()
          this.$buefy.snackbar.open('You comment has been created successfully')
          this.newComment.comment = null
          this.$v.newComment.$reset()
        } else {
          this.$buefy.toast.open({
            duration: 5000,
            message: `Error creating new comment`,
            position: 'is-bottom',
            type: 'is-danger'
          })
        }
      }
    }
  },
  validations: {
    newComment: {
      comment: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(2000)
      }
    }
  }
}
</script>
