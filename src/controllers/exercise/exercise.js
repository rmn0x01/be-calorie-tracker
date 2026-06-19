const ExerciseService = require('../../services/exercise');

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidOptionalNumber(value) {
  return value === undefined || value === null || isValidNumber(value);
}

module.exports = class ExerciseController {
  static async create(req, res) {
    try {
      const body = req.body || {};

      const type = typeof body.type === 'string' ? body.type.trim() : '';
      if (!type) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'type is required and must be a non-empty string',
        });
      }

      const durationMinutes = body.durationMinutes;
      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'durationMinutes is required and must be a positive integer',
        });
      }

      const caloriesBurned = body.caloriesBurned;
      if (!isValidNumber(caloriesBurned) || caloriesBurned < 0) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'caloriesBurned is required and must be a non-negative number',
        });
      }

      if (!isValidOptionalNumber(body.distanceKm)) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'distanceKm must be a number when provided',
        });
      }

      if (!isValidOptionalNumber(body.volumeKg)) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'volumeKg must be a number when provided',
        });
      }

      const payload = {
        type,
        durationMinutes: Number(durationMinutes),
        caloriesBurned: Number(caloriesBurned),
        distanceKm: body.distanceKm != null ? Number(body.distanceKm) : null,
        volumeKg: body.volumeKg != null ? Number(body.volumeKg) : null,
      };

      const entry = await ExerciseService.create(req.userId, payload);
      return res.status(201).json({
        data: entry.toJSON(),
      });
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create exercise entry',
      });
    }
  }

  static async getList(req, res) {
    try {
      const { query } = req;
      const rows = await ExerciseService.list(query, req.userId);
      return res.status(200).json({
        data: rows,
      });
    } catch (err) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list exercise entries',
      });
    }
  }
};
