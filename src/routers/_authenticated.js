const express = require('express')
const router = express.Router()

const userManagementRouter = require('./user-management')
const calorieEntryRouter = require('./calorie-entry')
const mealRouter = require('./meal')
const authentication = require('../middlewares/authentication')

router.use('/user-management', authentication, userManagementRouter)
router.use('/calorie-entry', authentication, calorieEntryRouter)
router.use('/meal', authentication, mealRouter)

module.exports = router
