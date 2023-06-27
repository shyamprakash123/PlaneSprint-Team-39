/* eslint-disable no-unused-vars */
'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('topicDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      videos: {
        type: Sequelize.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      imgs: {
        type: Sequelize.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      pdf: {
        type: Sequelize.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      topicId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('topicDetails');
  }
};