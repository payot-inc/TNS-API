'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    isNotifyCoin: DataTypes.BOOLEAN,
    isNotifyStock: DataTypes.BOOLEAN,
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};