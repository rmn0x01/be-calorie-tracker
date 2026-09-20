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
      const { calorieGoal, weightKg, targetWeightKg, heightCm, bornDate } = req.body

      // Validate calorieGoal is an integer
      if (calorieGoal !== undefined && calorieGoal !== null) {
        if (!Number.isInteger(calorieGoal) || calorieGoal < 0) {
          return res.status(400).json({
            error: 'INVALID_CALORIE_GOAL',
            message: 'calorieGoal must be a positive integer or null',
          })
        }
      }

      // Validate weightKg
      if (weightKg !== undefined && weightKg !== null) {
        if (typeof weightKg !== 'number' || weightKg <= 0 || weightKg > 999.99) {
          return res.status(400).json({
            error: 'INVALID_WEIGHT',
            message: 'weightKg must be a positive number (max 999.99)',
          })
        }
      }

      // Validate targetWeightKg
      if (targetWeightKg !== undefined && targetWeightKg !== null) {
        if (typeof targetWeightKg !== 'number' || targetWeightKg <= 0 || targetWeightKg > 999.99) {
          return res.status(400).json({
            error: 'INVALID_TARGET_WEIGHT',
            message: 'targetWeightKg must be a positive number (max 999.99)',
          })
        }
      }

      // Validate heightCm
      if (heightCm !== undefined && heightCm !== null) {
        if (typeof heightCm !== 'number' || heightCm <= 0 || heightCm > 999.99) {
          return res.status(400).json({
            error: 'INVALID_HEIGHT',
            message: 'heightCm must be a positive number (max 999.99)',
          })
        }
      }

      // Validate bornDate
      if (bornDate !== undefined && bornDate !== null) {
        if (typeof bornDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(bornDate)) {
          return res.status(400).json({
            error: 'INVALID_BORN_DATE',
            message: 'bornDate must be a valid date in YYYY-MM-DD format',
          })
        }
        const parsed = new Date(bornDate)
        if (Number.isNaN(parsed.getTime()) || parsed >= new Date()) {
          return res.status(400).json({
            error: 'INVALID_BORN_DATE',
            message: 'bornDate must be a valid past date',
          })
        }
      }

      // Build updates object with only provided fields
      const updates = {}
      if (calorieGoal !== undefined) updates.calorieGoal = calorieGoal
      if (weightKg !== undefined) updates.weightKg = weightKg
      if (targetWeightKg !== undefined) updates.targetWeightKg = targetWeightKg
      if (heightCm !== undefined) updates.heightCm = heightCm
      if (bornDate !== undefined) updates.bornDate = bornDate

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'NO_FIELDS_TO_UPDATE',
          message: 'At least one field must be provided',
        })
      }

      // Update user via UserService
      const updated = await UserService.updateById(req.userId, updates)

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