const express = require('express')
const router = express.Router()
const ExerciseController = require('../controllers/exercise')

router.post('/', ExerciseController.create)
router.get('/', ExerciseController.getList)

module.exports = router
