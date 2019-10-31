import db from './db/models';
import { chain, range } from 'lodash';
import numeral from 'numeral';
import faker from 'faker';

const machines = chain()
  .range(30)
  .map((index) => {
    return {
      id: numeral(index + 1).format('000'),
      name: `${index + 1}자판기`,
      isBroken: false,
    };
  })
  .value();

const products = chain(machines)
  .map(({ id: machineId }) => {
    return chain()
      .range(10)
      .map((index) => {
        const productId = `${machineId}${numeral(index + 1).format('000')}`;
        return {
          id: productId,
          name: `상품명 ${productId}`,
          price: faker.random.number({ min: 1000, max: 3000, precision: 500 }),
          count: faker.random.number({ min: 5, max: 20 }),
          machineId,
        };
      })
      .value();
  })
  .flatten()
  .value();

db.sequelize
  .sync({ force: true })
  .then(() => db.kiosk.create({}))
  .then(() => db.machine.bulkCreate(machines))
  .then(() => db.product.bulkCreate(products))
  .then(console.log, console.log);
