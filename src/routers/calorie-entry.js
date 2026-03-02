const express = require('express')
const router = express.Router()
const CalorieEntryController = require('../controllers/calorieEntry')

router.post('/', CalorieEntryController.create)
router.get('/', CalorieEntryController.getList)
router.get('/calories-today', CalorieEntryController.getCaloriesToday)
router.get('/avg-calories-weekly', CalorieEntryController.getAvgCaloriesWeekly)

module.exports = router
