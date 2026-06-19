'use strict';

const { Op, fn, col, literal } = require('sequelize');
const CalorieEntry = require('../models/calorieEntry');
const Exercise = require('../models/exercise');
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

    // Fetch calorie entries per day
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

    // Fetch exercise calories burned per day
    const exerciseEntries = await Exercise.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'day'],
        [fn('SUM', col('calories_burned')), 'totalCaloriesBurned'],
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

    // Build a map of date -> total calories burned from exercise
    const exerciseMap = {};
    for (const ex of exerciseEntries) {
      exerciseMap[ex.day] = ex.totalCaloriesBurned;
    }

    // Fetch user info
    const user = await UserService.findById(userId);
    const targetCalories = user?.calorieGoal || 2000;
    const currentWeight = user?.weightKg;
    const currentHeight = user?.heightCm;
    const targetWeight = user?.targetWeightKg;

    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyLines = entries.map((entry) => {
      const date = new Date(entry.day);
      const dayName = dayLabels[date.getDay()];
      const protein = entry.totalProtein != null ? `${entry.totalProtein}g protein` : '';
      const carbs = entry.totalCarbs != null ? `${entry.totalCarbs}g carbs` : '';
      const fat = entry.totalFat != null ? `${entry.totalFat}g fat` : '';
      const macros = [protein, carbs, fat].filter(Boolean).join(', ');
      const exerciseCalories = exerciseMap[entry.day];
      const exerciseLine = exerciseCalories != null ? ` | Exercise burned: ${exerciseCalories} calories` : '';
      return macros
        ? `${dayName}: ${entry.totalCalories} calories (${macros})${exerciseLine}`
        : `${dayName}: ${entry.totalCalories} calories${exerciseLine}`;
    }).join('\n');

    // Build user profile section
    const profileLines = [];
    profileLines.push(`Target daily calories: ${targetCalories}`);
    if (currentWeight != null) profileLines.push(`Current weight: ${currentWeight} kg`);
    if (currentHeight != null) profileLines.push(`Height: ${currentHeight} cm`);
    if (targetWeight != null) profileLines.push(`Target weight: ${targetWeight} kg`);

    const promptContent = `${profileLines.join('\n')}\n\nWeekly intake:\n${dailyLines}`;

    const aiPayload = {
      model: 'qwen3:8b',
      format: {
        type: 'object',
        properties: {
          grade: { type: 'string' },
          scores: {
            type: 'object',
            properties: {
              consistency: { type: 'string' },
              intakeCalorieControl: { type: 'string' },
              exercise: { type: 'string' },
            },
          },
          summary: { type: 'string' },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          nextChallenge: { type: 'string' },
        },
        required: ['grade', 'summary', 'recommendations', 'scores', 'nextChallenge'],
      },
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition coach and weight loss coach. Analyze weekly calorie intake, exercise, and user profile data. Provide concise, actionable feedback on how the user can adjust their habits to reach their target weight. For scores, also assign the value ranged from A to E',
        },
        {
          role: 'user',
          content: promptContent,
        },
      ],
      stream: false,
      think: false,
    };

    const aiResponse = await chatCompletion(aiPayload);
    try {
      return JSON.parse(aiResponse.message.content);
    } catch {
      return aiResponse.message.content;
    }
  },
}

module.exports = CalorieEntryService
