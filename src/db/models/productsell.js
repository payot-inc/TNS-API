'use strict';
module.exports = (sequelize, DataTypes) => {
  const productSell = sequelize.define('productSell', {
    quantity: DataTypes.INTEGER
  }, {});
  productSell.associate = function(models) {
    // associations can be defined here
    productSell.belongsTo(models.product);
    productSell.belongsTo(models.sell);
  };
  return productSell;
};