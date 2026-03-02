/* eslint-disable no-unused-vars */
'use strict';

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!password) {
      throw new Error('SUPERADMIN_PASSWORD is not set in the environment');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();

    await queryInterface.bulkInsert(
      'user',
      [
        {
          id: uuidv4(),
          email: 'superadmin@foo.com',
          password: hashedPassword,
          firstname: 'super',
          lastname: 'admin',
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'user',
      {
        email: 'superadmin@foo.com',
      },
      {}
    );
  },
};

