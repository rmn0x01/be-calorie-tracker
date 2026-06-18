const MealService = require('../../services/meal');

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidOptionalNumber(value) {
  return value === undefined || value === null || isValidNumber(value);
}

module.exports = class MealController {
  static async create(req, res) {
    try {
      const body = req.body || {};

      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'name is required and must be a non-empty string',
        });
      }

      const calories = body.calories;
      if (!isValidNumber(calories) || calories < 0) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'calories is required and must be a non-negative number',
        });
      }

      const optionalNumbers = ['protein', 'carbs', 'fat'];
      for (const key of optionalNumbers) {
        if (!isValidOptionalNumber(body[key])) {
          return res.status(400).json({
            error: 'INVALID_REQUEST_BODY',
            message: `${key} must be a number when provided`,
          });
        }
      }

      if (body.unit !== undefined && body.unit !== null && typeof body.unit !== 'string') {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'unit must be a string when provided',
        });
      }

      const payload = {
        name,
        calories: Number(calories),
        protein: body.protein != null ? Number(body.protein) : null,
        carbs: body.carbs != null ? Number(body.carbs) : null,
        fat: body.fat != null ? Number(body.fat) : null,
        unit: body.unit != null ? String(body.unit) : null,
      };

      const meal = await MealService.create(payload);
      return res.status(201).json({
        data: meal.toJSON(),
      });
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create meal',
      });
    }
  }

  static async getList(req, res) {
    try {
      const { query } = req;
      const rows = await MealService.list(query);
      return res.status(200).json({
        data: rows,
      });
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list meals',
      });
    }
  }
};
