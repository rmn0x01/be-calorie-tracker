const http = require('http')

const HomeService = {
  async printHome() {
    return 'home'
  },

  async debugOllamaTags() {
    return new Promise((resolve, reject) => {
      http.get('http://localhost:11434/api/tags', (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve(data)
          }
        })
      }).on('error', (err) => {
        reject(err)
      })
    })
  }
}

module.exports = HomeService