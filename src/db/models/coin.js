'use strict';
module.exports = (sequelize, DataTypes) => {
  const coin = sequelize.define(
    'coin',
    {
      amount: { type: DataTypes.DECIMAL, allowNull: false, comment: '금액 투입로그' },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.NOW, comment: '투입일자' },
    },
    {
      timestamps: false,
      comment: '동전 투입 로그',
    },
  );
  coin.associate = function(models) {
    // associations can be defined here
  };
  return coin;
};
