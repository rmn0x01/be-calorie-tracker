'use strict';

const { sequelize } = require('../../config/database');

const User = require('./user');
const UserToken = require('./userToken');
const CalorieEntry = require('./calorieEntry');
const Meal = require('./meal');
const Exercise = require('./exercise');

const models = {
  User,
  UserToken,
  CalorieEntry,
  Meal,
  Exercise,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
