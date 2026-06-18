const http = require('http')

const BASE_URL = process.env.LOCAL_MODEL_URL || 'localhost:11434'

function buildUrl(path) {
  return `http://${BASE_URL}${path}`
}

async function chatCompletion(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload)
    const url = new URL(buildUrl('/api/chat'))

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          reject(new Error('Failed to parse AI response'))
        }
      })
    })

    req.on('error', (err) => reject(err))
    req.write(data)
    req.end()
  })
}

module.exports = { chatCompletion }
