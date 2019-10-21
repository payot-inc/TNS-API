'use strict';
module.exports = (sequelize, DataTypes) => {
  const sell = sequelize.define('sell', {
    amount: DataTypes.DECIMAL,
    method: DataTypes.STRING,
    change: { type: DataTypes.DECIMAL, defaultValue: 0 }
  }, {});
  sell.associate = function(models) {
    // associations can be defined here
    sell.hasMany(models.productSell);
  };
  return sell;
};