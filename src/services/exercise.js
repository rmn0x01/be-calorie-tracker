'use strict';

const { Op } = require('sequelize');
const Exercise = require('../models/exercise');

function getDateRange(date) {
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfTomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { startOfToday, startOfTomorrow };
}

const ExerciseService = {
  async create(userId, payload) {
    const entry = await Exercise.create({
      userId,
      type: payload.type,
      durationMinutes: payload.durationMinutes,
      distanceKm: payload.distanceKm ?? null,
      volumeKg: payload.volumeKg ?? null,
      caloriesBurned: payload.caloriesBurned,
    });
    return entry;
  },

  async list(query = {}, userId) {
    const whereFilter = { userId };

    if (query.startDate || query.endDate) {
      whereFilter.createdAt = {};
      if (query.startDate) {
        const { startOfToday } = getDateRange(new Date(query.startDate));
        whereFilter.createdAt[Op.gte] = startOfToday;
      }
      if (query.endDate) {
        const { startOfTomorrow } = getDateRange(new Date(query.endDate));
        whereFilter.createdAt[Op.lt] = startOfTomorrow;
      }
    }

    const rows = await Exercise.findAll({
      where: whereFilter,
      order: [['createdAt', 'DESC']],
    });
    return rows;
  },
};

module.exports = ExerciseService;
