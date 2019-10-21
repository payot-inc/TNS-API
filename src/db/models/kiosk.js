'use strict';
module.exports = (sequelize, DataTypes) => {
  const kiosk = sequelize.define('kiosk', {
    coin10: { type: DataTypes.INTEGER, defaultValue: 0 },
    coin50: { type: DataTypes.INTEGER, defaultValue: 0 },
    coin100: { type: DataTypes.INTEGER, defaultValue: 0 },
    coin500: { type: DataTypes.INTEGER, defaultValue: 0 },
    coin1000: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    timestamps: false,
  });
  kiosk.associate = function(models) {
    // associations can be defined here
  };
  return kiosk;
};