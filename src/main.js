import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import rest from './rest'
import Storage from 'vue-ls'
import Vuelidate from 'vuelidate'
import VuelidateErrorExtractor, { templates } from 'vuelidate-error-extractor'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { store } from './stores/chat'

import './assets/styles.scss'

import {
  faCheck, faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle, faPaperPlane, faImages, faTrash,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown, faSignOutAlt, faCloudUploadAlt, faUserCircle, faEdit, faUndo,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload, faComments, faComment, faThumbsUp, faTimesCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FormGroup from './components/FormGroup.vue'

library.add(faCheck, faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle, faUserCircle, faEdit,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown, faSignOutAlt, faCloudUploadAlt, faPaperPlane, faImages, faTrash,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload, faComments, faComment, faThumbsUp, faTimesCircle, faUndo)
Vue.component('vue-fontawesome', FontAwesomeIcon)

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.mixin(rest)
Vue.use(Storage)
Vue.use(Buefy, {
  defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas'
})
Vue.use(Vuelidate)
Vue.use(VuelidateErrorExtractor, {
  messages: {
    required: 'Field {attribute} is required',
    email: 'Field {attribute} is not a proper email address',
    minLength: 'The value is too short',
    maxLength: 'The value is too long',
    isUnique: 'Username already exists',
    sameAsPassword: 'The passwords do not match'
  },
  attributes: {
    name: 'Name',
    email: 'Email',
    text: 'Text'
  }
})

Vue.component('FormGroup', FormGroup)
Vue.component('formWrapper', templates.FormWrapper)
Vue.prototype.$eventHub = new Vue()

const vueApp = new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app')

window.VueApp = vueApp
