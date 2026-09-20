'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class Exercise extends Model {}

Exercise.init(
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
      field: 'user_id',
      references: {
        model: 'user',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_minutes',
    },
    distanceKm: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'distance_km',
    },
    volumeKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'volume_kg',
    },
    caloriesBurned: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'calories_burned',
    },
  },
  {
    sequelize,
    modelName: 'Exercise',
    tableName: 'exercise',
  }
);

Exercise.associate = function (models) {
  Exercise.belongsTo(models.User, {
    foreignKey: 'userId',
  });
};

module.exports = Exercise;
