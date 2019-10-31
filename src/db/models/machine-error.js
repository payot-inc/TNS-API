'use strict';
module.exports = (sequelize, DataTypes) => {
  const machineError = sequelize.define(
    'machineError',
    {
      reason: DataTypes.TEXT,
      sms: DataTypes.TEXT,
    },
    {},
  );
  machineError.associate = function(models) {};
  return machineError;
};
