<template>
  <aside class="sidebar">
    <div class="chat-wrapper">
      <div class="chat-area">
        <div class="chat-scroll">
          <h2 class="title">Pictures Chat</h2>
          <div
            v-for="(msg,index) in chatMessages"
            :key="'chat_message_'+index"
            class="field"
          >
            <div class="tag"
                 :class="{ 'is-primary': msg.user_id === currentUserID, 'is-info': msg.user_id !== currentUserID}">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal is-grouped chat-form">
        <b-input type="text" v-model="newMsgText" :expanded="true" @keyup.native.enter="sendNewMessage" />
        <b-button icon-right="paper-plane" type="is-primary" @click="sendNewMessage" />
      </div>
    </div>
  </aside>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'SidebarChat',
  data () {
    return {
      newMsgText: '',
      currentUserID: 0
    }
  },
  computed: mapState({
    chatMessages: state => state.chatMessages,
    chatParticipants: state => state.chatParticipants
  }),
  created () {
    this.currentUserID = parseInt(this.$ls.get('user_id'))
  },
  mounted () {
    this.$store.dispatch('connectWebSocket')
  },
  beforeDestroy () {
    this.$store.dispatch('disconnectWebSocket')
  },
  watch: {
    chatParticipants (newVal, oldVal) {
      console.log('Participants update', newVal, oldVal)
      if (newVal.length > oldVal.length) {

      } else {
        const disconnected = oldVal.filter(ov => !newVal.includes(ov))
        console.log('DISCONNECTED', disconnected)
      }
    }
  },
  methods: {
    sendNewMessage () {
      this.newMsgText = this.newMsgText.trim()
      if (this.newMsgText.length > 0) {
        this.$store.dispatch('sendWsMessage', this.newMsgText)
        this.newMsgText = ''
      }
    }
  }
}
</script>
