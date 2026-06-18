const CalorieEntryService = require('../../services/calorieEntry')

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidOptionalNumber(value) {
  return value === undefined || value === null || isValidNumber(value)
}

module.exports = class CalorieEntryController {
  static async create(req, res) {
    try {
      const body = req.body || {}

      const foodName =
        typeof body.foodName === 'string' ? body.foodName.trim() : ''
      if (!foodName) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'foodName is required and must be a non-empty string',
        })
      }

      const calorieAmount = body.calorieAmount
      if (!isValidNumber(calorieAmount) || calorieAmount < 0) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'calorieAmount is required and must be a non-negative number',
        })
      }

      const optionalNumbers = ['protein', 'carbs', 'fat', 'quantity']
      for (const key of optionalNumbers) {
        if (!isValidOptionalNumber(body[key])) {
          return res.status(400).json({
            error: 'INVALID_REQUEST_BODY',
            message: `${key} must be a number when provided`,
          })
        }
      }

      const optionalStrings = ['unit', 'mealType', 'notes']
      for (const key of optionalStrings) {
        if (body[key] !== undefined && body[key] !== null && typeof body[key] !== 'string') {
          return res.status(400).json({
            error: 'INVALID_REQUEST_BODY',
            message: `${key} must be a string when provided`,
          })
        }
      }

      const payload = {
        foodName,
        calorieAmount: Number(calorieAmount),
        protein: body.protein != null ? Number(body.protein) : null,
        carbs: body.carbs != null ? Number(body.carbs) : null,
        fat: body.fat != null ? Number(body.fat) : null,
        quantity: body.quantity != null ? Number(body.quantity) : null,
        unit: body.unit != null ? String(body.unit) : null,
        mealType: body.mealType != null ? String(body.mealType) : null,
        notes: body.notes != null ? String(body.notes) : null,
      }

      const entry = await CalorieEntryService.create(req.userId, payload)
      return res.status(201).json({
        data: entry.toJSON(),
      })
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create calorie entry',
      })
    }
  }

  static async getCaloriesToday(req, res) {
    try {
      const total = await CalorieEntryService.getTotalCaloriesToday(req.userId)
      return res.status(200).json({
        data: { totalCalories: total },
      })
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get calories today',
      })
    }
  }

  static async getAvgCaloriesWeekly(req, res) {
    try {
      const total = await CalorieEntryService.getWeeklyCaloriesTotal(req.userId)
      const avgCaloriesWeekly = Math.round((total / 7) * 100) / 100
      return res.status(200).json({
        data: { avg_calories_weekly: avgCaloriesWeekly },
      })
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get average calories weekly',
      })
    }
  }

  static async getList(req, res) {
    const { query } = req
    const rows = await CalorieEntryService.list(query, req.userId)
    return res.status(200).json({
      data: rows,
    })
  }

  static async analyzeWeekly(req, res, next) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'INVALID_REQUEST',
          message: 'startDate and endDate are required',
        })
      }

      const result = await CalorieEntryService.analyzeWeekly(req.userId, startDate, endDate)
      return res.status(200).json({
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
}
