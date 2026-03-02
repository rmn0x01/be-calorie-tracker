const UserService = require('../../services/user')

module.exports = class Controller {
  static async findByLoggedIn(req, res) {
    try {
      const user = await UserService.findById(req.userId)
      if (!user) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const { password, ...userData } = user.toJSON()
      return res.status(200).json(userData)
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user',
      })
    }
  }

  static async updateByLoggedIn(req, res) {
    try {
      const { calorieGoal } = req.body

      // Validate calorieGoal is an integer
      if (calorieGoal !== null && (!Number.isInteger(calorieGoal) || calorieGoal < 0)) {
        return res.status(400).json({
          error: 'INVALID_CALORIE_GOAL',
          message: 'calorieGoal must be a positive integer or null',
        })
      }

      // Update user via UserService
      const updated = await UserService.updateById(req.userId, {
        calorieGoal: calorieGoal,
      })

      if (!updated) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return res.status(204).send()
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user',
      })
    }
  }
}