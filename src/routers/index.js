const express = require('express')
const router = express.Router()
const publicRouter = require('./_public')
const authenticatedRouter = require('./_authenticated')

router.use(publicRouter)
router.use(authenticatedRouter)

module.exports = router
