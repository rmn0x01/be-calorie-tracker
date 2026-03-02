const express = require('express')
const router = express.Router()
const CalorieEntryController = require('../controllers/calorieEntry')

router.post('/', CalorieEntryController.create)
router.get('/', CalorieEntryController.getList)
router.get('/calories-today', CalorieEntryController.getCaloriesToday)

module.exports = router
