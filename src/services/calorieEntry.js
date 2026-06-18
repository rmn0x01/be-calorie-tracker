'use strict';

const { Op, fn, col, literal } = require('sequelize');
const CalorieEntry = require('../models/calorieEntry');
const UserService = require('./user');
const { chatCompletion } = require('../helpers/localAi');

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
    } else if (query.startDate || query.endDate) {
      whereFilter.createdAt = {}
      if (query.startDate) {
        const { startOfToday } = getDateRange(new Date(query.startDate));
        whereFilter.createdAt[Op.gte] = startOfToday;
      }
      if (query.endDate) {
        const { startOfTomorrow } = getDateRange(new Date(query.endDate));
        whereFilter.createdAt[Op.lt] = startOfTomorrow;
      }
    }
    const rows = CalorieEntry.findAll({
      where: whereFilter,
      order: [['createdAt', 'DESC']],
    })
    return rows
  },

  async analyzeWeekly(userId, startDate, endDate) {
    const { startOfToday: rangeStart } = getDateRange(new Date(startDate));
    const { startOfTomorrow: rangeEnd } = getDateRange(new Date(endDate));

    const entries = await CalorieEntry.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'day'],
        [fn('SUM', col('calorie_amount')), 'totalCalories'],
        [fn('SUM', col('protein')), 'totalProtein'],
        [fn('SUM', col('carbs')), 'totalCarbs'],
        [fn('SUM', col('fat')), 'totalFat'],
      ],
      where: {
        userId,
        createdAt: {
          [Op.gte]: rangeStart,
          [Op.lt]: rangeEnd,
        },
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    const user = await UserService.findById(userId);
    const targetCalories = user?.calorieGoal || 2000;

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyLines = entries.map((entry) => {
      const date = new Date(entry.day);
      const dayName = dayLabels[date.getDay()];
      const protein = entry.totalProtein != null ? `${entry.totalProtein}g protein` : '';
      const carbs = entry.totalCarbs != null ? `${entry.totalCarbs}g carbs` : '';
      const fat = entry.totalFat != null ? `${entry.totalFat}g fat` : '';
      const macros = [protein, carbs, fat].filter(Boolean).join(', ');
      return macros ? `${dayName}: ${entry.totalCalories} calories (${macros})` : `${dayName}: ${entry.totalCalories}`;
    }).join('\n');

    const promptContent = `Target calories: ${targetCalories}\n\n${dailyLines}`;

    const aiPayload = {
      model: 'qwen3:8b',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition coach. Analyze weekly calorie intake patterns and provide concise feedback.',
        },
        {
          role: 'user',
          content: promptContent,
        },
      ],
      stream: false,
      think: false,
    };

    console.log(aiPayload);

    const aiResponse = await chatCompletion(aiPayload);
    return aiResponse.message.content;
  },
}

module.exports = CalorieEntryService
