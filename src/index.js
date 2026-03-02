const express = require('express')
const router = require('./routers')

// Load models so associations are registered
require('./models')

const cors = require('cors')
const app = express()
const port = 3010

app.use(cors())

// Parse incoming JSON request bodies
app.use(express.json())

// Optionally support URL-encoded form bodies as well
app.use(express.urlencoded({ extended: true }))

app.use(router)

app.listen(port, () => {
  console.log('Listening on port ' + port)
})