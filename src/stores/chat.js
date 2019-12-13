import Vue from 'vue'
import Vuex from 'vuex'
import config from '../../config'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    chatMessages: localStorage.getItem('chat_messages') !== null ? JSON.parse(localStorage.getItem('chat_messages')) : [],
    chatParticipants: localStorage.getItem('chat_participants') !== null ? JSON.parse(localStorage.getItem('chat_participants')) : [],
    wsConnection: null
  },
  getters: {},
  actions: {
    disconnectWebSocket ({ commit, state }) {
      if (state.wsConnection != null) {
        state.wsConnection.close()
        commit('onWsClosed')
      }
    },
    connectWebSocket ({ commit, dispatch }) {
      if ('WebSocket' in window) {
        const tokenValue = JSON.parse(localStorage.getItem('token'))
        const wsConnection = new WebSocket(`ws://${config.apiHost}:${config.apiPort}/websocket`, ['access_token', tokenValue.value])
        wsConnection.onopen = () => { console.log('WS Connection open') }
        wsConnection.onmessage = (evt) => {
          dispatch('onWsMessage', evt)
        }
        wsConnection.onclose = () => {
          dispatch('onWsClose')
        }
        commit('onWsConnected', wsConnection)
      } else {
        console.log('WebSockets NO soportados por tu navegador!')
      }
    },
    onWsMessage ({ dispatch, commit }, evt) {
      const newMsg = JSON.parse(evt.data)
      if (newMsg.type === 'message') {
        commit('onNewMessage', newMsg)
      } else if (newMsg.type === 'connection') {
        commit('onNewConnection', newMsg)
      } else if (newMsg.type === 'disconnection') {
        commit('onNewDisconnection', newMsg)
      }
    },
    onWsClose () {
      console.log('MEssage connection close')
    },
    sendWsMessage ({ state }, msg) {
      state.wsConnection.send(JSON.stringify({ type: 'message', content: msg }))
    }
  },
  mutations: {
    onWsConnected (state, wsConnection) {
      state.wsConnection = wsConnection
    },
    onWsClosed (state) {
      state.wsConnection = null
      state.chatMessages = []
      state.chatParticipants = []
    },
    onNewMessage (state, newMessage) {
      state.chatMessages.push(newMessage)
      localStorage.setItem('chat_messages', JSON.stringify(state.chatMessages))
    },
    onNewConnection (state, userData) {
      if (!state.chatParticipants.includes(userData)) {
        state.chatParticipants.push(userData)
        localStorage.setItem('chat_participants', JSON.stringify(state.chatParticipants))
      }
    },
    onNewDisconnection (state, userData) {
      const userIndex = state.chatParticipants.findIndex(ud => ud.user_id === userData.user_id)
      console.log('USER INDEX DELETE', userIndex)
      state.chatParticipants.splice(userIndex, 1)
      localStorage.setItem('chat_participants', JSON.stringify(state.chatParticipants))
    }
  }
})
