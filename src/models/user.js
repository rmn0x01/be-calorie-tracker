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
  User.hasMany(models.Exercise, {
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
    weightKg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'weight_kg',
    },
    targetWeightKg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'target_weight_kg',
    },
    heightCm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'height_cm',
    },
    bornDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'born_date',
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'user',
  }
);

module.exports = User;

