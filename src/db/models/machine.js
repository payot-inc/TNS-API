'use strict';
module.exports = (sequelize, DataTypes) => {
  const machine = sequelize.define(
    'machine',
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: DataTypes.STRING,
    },
    {
      timestamps: false,
    },
  );
  machine.associate = function(models) {
    // associations can be defined here
    machine.hasMany(models.product);
  };
  return machine;
};
