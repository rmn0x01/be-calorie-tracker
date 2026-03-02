'use strict';

const { Op } = require('sequelize');
const CalorieEntry = require('../models/calorieEntry');

function getTodayRange() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { startOfToday, startOfTomorrow };
}

function getWeekRange() {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
}

function getDateRange(date) {
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfTomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { startOfToday, startOfTomorrow };
}

const CalorieEntryService = {
  async create(userId, payload) {
    const entry = await CalorieEntry.create({
      userId,
      foodName: payload.foodName,
      calorieAmount: payload.calorieAmount,
      protein: payload.protein ?? null,
      carbs: payload.carbs ?? null,
      fat: payload.fat ?? null,
      quantity: payload.quantity ?? null,
      unit: payload.unit ?? null,
      mealType: payload.mealType ?? null,
      notes: payload.notes ?? null,
    })
    return entry
  },

  async getTotalCaloriesToday(userId) {
    const { startOfToday, startOfTomorrow } = getTodayRange();
    const result = await CalorieEntry.sum('calorieAmount', {
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfToday,
          [Op.lt]: startOfTomorrow,
        },
      },
    });
    return result ?? 0;
  },

  async getWeeklyCaloriesTotal(userId) {
    const { monday, sunday } = getWeekRange();
    const result = await CalorieEntry.sum('calorieAmount', {
      where: {
        userId,
        createdAt: {
          [Op.gte]: monday,
          [Op.lte]: sunday,
        },
      },
    });
    return result ?? 0;
  },

  async list(query = {}, userId) {
    let whereFilter = {
      userId
    }
    if (query.dateFilter) {
      const { startOfToday, startOfTomorrow } = getDateRange(new Date(query.dateFilter));
      whereFilter.createdAt = {
        [Op.gte]: startOfToday,
        [Op.lt]: startOfTomorrow,
      }
    }
    const rows = CalorieEntry.findAll({
      where: whereFilter,
      order: [['createdAt', 'DESC']],
    })
    return rows
  },
}

module.exports = CalorieEntryService
