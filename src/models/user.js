'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class User extends Model {}

User.associate = function (models) {
  User.hasMany(models.UserToken, {
    foreignKey: 'userId',
  });
  User.hasMany(models.CalorieEntry, {
    foreignKey: 'userId',
  });
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'firstname',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'lastname',
    },
    calorieGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'calorie_goal',
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'user',
  }
);

module.exports = User;

