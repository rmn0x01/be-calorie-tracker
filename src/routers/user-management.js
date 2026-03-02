const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')

router.get('/my', UserController.findByLoggedIn)
router.put('/my', UserController.updateByLoggedIn)

module.exports = router
