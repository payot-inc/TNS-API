import db from '../db/models';
const { sequelize, Sequelize } = db;

global.db = db;
global.Op = Sequelize.Op;
global.sequelize = sequelize;

db.sequelize.sync().then(() => console.log('db 초기화'));
