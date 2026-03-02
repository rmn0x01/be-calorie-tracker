'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class CalorieEntry extends Model {}

CalorieEntry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    foodName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calorieAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    protein: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    carbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mealType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'CalorieEntry',
    tableName: 'calorie_entry',
  }
);

CalorieEntry.associate = function (models) {
  CalorieEntry.belongsTo(models.User, {
    foreignKey: 'userId',
  });
};

module.exports = CalorieEntry;
