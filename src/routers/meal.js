const express = require('express')
const router = express.Router()
const MealController = require('../controllers/meal')

router.post('/', MealController.create)
router.get('/', MealController.getList)
router.get('/external-usda', MealController.getExternalUSDA)

module.exports = router
