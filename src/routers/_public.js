const express = require('express')
const router = express.Router()

const HomeController = require('../controllers/home')
const AuthController = require('../controllers/auth')

router.get('/', HomeController.getHome)
router.post('/login', AuthController.login)

module.exports = router
