'use strict';
module.exports = (sequelize, DataTypes) => {
  const sell = sequelize.define(
    'sell',
    {
      amount: { type: DataTypes.DECIMAL },
      method: DataTypes.STRING,
      products: { type: DataTypes.JSON },
      change: { type: DataTypes.DECIMAL, defaultValue: 0 },
    },
    {},
  );
  sell.associate = function(models) {};
  return sell;
};
