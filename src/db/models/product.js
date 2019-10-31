'use strict';
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    'product',
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      count: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    },
  );
  product.associate = function(models) {
    // associations can be defined here
    product.belongsTo(models.machine);
  };
  return product;
};
