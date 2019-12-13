import axios from 'axios'
import config from '../config'

export default {
  methods: {
    isLoggedIn () {
      const token = this.$ls.get('token')
      return token && token.length > 0
    },
    buildApiURL (relUrl) {
      return `${config.apiProtocol}://${config.apiHost}:${config.apiPort}/${relUrl}`
    },
    getRequestHeaders (extraHeaders) {
      let token = localStorage.getItem('token')
      if (token) {
        token = JSON.parse(token).value
      }
      const newHeaders = { 'Accept': 'application/json' }
      if (token !== null && token.length > 0) {
        newHeaders['Authorization'] = 'Bearer ' + token
      }
      if (extraHeaders !== undefined) {
        for (let key in extraHeaders) {
          if (extraHeaders.hasOwnProperty(key)) {
            newHeaders[key] = extraHeaders[key]
          }
        }
      }
      return newHeaders
    },
    apiGet (url, extraHeaders) {
      let headers = this.getRequestHeaders(extraHeaders)
      return this.performRequest(axios.get, [this.buildApiURL(url), { headers: headers }])
    },
    apiPost (url, data, extraHeaders) {
      let headers = this.getRequestHeaders(extraHeaders)
      return this.performRequest(axios.post, [this.buildApiURL(url), data, { headers: headers }])
    },
    apiDelete (url, extraHeaders) {
      let headers = this.getRequestHeaders(extraHeaders)
      return this.performRequest(axios.delete, [this.buildApiURL(url), { headers: headers }])
    },
    apiPut (url, data, extraHeaders) {
      let headers = this.getRequestHeaders(extraHeaders)
      return this.performRequest(axios.put, [this.buildApiURL(url), data, { headers: headers }])
    },
    apiHead (url, extraHeaders) {
      let headers = this.getRequestHeaders(extraHeaders)
      return this.performRequest(axios.head, [this.buildApiURL(url), { headers: headers }])
    },
    performRequest (axiosFnx, fnxParams) {
      return new Promise(
        (resolve) => {
          axiosFnx.apply(null, fnxParams).then(resolve).catch(
            err => {
              let response = { error: err }
              if (err.response) {
                response = err.response
                delete (err.response)
                response.error = err
              }
              resolve(response)
            }
          )
        }
      )
    },
    getAbsoluteURL (relURL) {
      if (relURL.charAt(0) === '/') {
        relURL = relURL.substring(1)
      }
      return `${config.apiProtocol}://${config.apiHost}:${config.apiPort}/${relURL}`
    }
  }
}
