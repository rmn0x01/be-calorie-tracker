'use strict';

const { Op } = require('sequelize');
const Meal = require('../models/meal');

function getDateRange(date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfNextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { startOfDay, startOfNextDay };
}

const MealService = {
  async create(payload) {
    const meal = await Meal.create({
      name: payload.name,
      calories: payload.calories,
      protein: payload.protein ?? null,
      carbs: payload.carbs ?? null,
      fat: payload.fat ?? null,
      unit: payload.unit ?? null,
    });
    return meal;
  },

  async list(query = {}) {
    const whereFilter = {};

    if (query.dateFilter) {
      const { startOfDay, startOfNextDay } = getDateRange(new Date(query.dateFilter));
      whereFilter.createdAt = {
        [Op.gte]: startOfDay,
        [Op.lt]: startOfNextDay,
      };
    }

    const rows = await Meal.findAll({
      where: whereFilter,
      order: [['createdAt', 'DESC']],
    });
    return rows;
  },
};

module.exports = MealService;
