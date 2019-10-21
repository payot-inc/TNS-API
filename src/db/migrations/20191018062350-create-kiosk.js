'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('kiosks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coin10: {
        type: Sequelize.INTEGER
      },
      coin50: {
        type: Sequelize.INTEGER
      },
      coin100: {
        type: Sequelize.INTEGER
      },
      coin500: {
        type: Sequelize.INTEGER
      },
      coin1000: {
        type: Sequelize.INTEGER
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('kiosks');
  }
};