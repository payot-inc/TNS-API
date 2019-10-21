import { event } from '../plugins/websocket';
import { from } from 'rxjs';
import { map, filter, flatMap, take } from 'rxjs/operators';
import {} from 'lodash';

// event.subscribe(console.log, console.log);

// 재고 정보 업데이트
event
  .pipe(
    filter(({ type }) => type === 'stock'),
    map(({ data }) => data),
    flatMap((data) => from(data)),
  )
  .subscribe((data) => {
    db.machine.findOrCreate({
      where: { id: data.machine },
      defaults: {
        id: data.machine,
        name: '자판기',
      },
    });

    const productId = `${data.machine}${data.product}`;
    db.product
      .findOrCreate({
        where: { id: productId },
        defaults: {
          name: '사이다',
          price: 1000,
          machineId: data.machine,
        },
      })
      .spread((product, created) => {
        return product.update({ count: Number(data.productCount) });
      });
  }, console.log);

// 거스름돈 업데이트
event
  .pipe(
    filter(({ type }) => type === 'coin'),
    map(({ data }) => data),
  )
  .subscribe(
    (data) => {
      db.kiosk.findOne({ where: { id: 1 } }).then((obj) => {
        if (obj) return db.kiosk.update(data, { where: { id: 1 } });
        db.kiosk.create({ id: 1, ...data });
      });
    },
    () => {},
  );

// 판매 목록 업데이트
event
  .pipe(
    filter(({ type }) => type === 'sell'),
    map(({ data }) => data),
  )
  .subscribe(({ amount, method, products, change }) => {
    db.sell.create({ amount, method, change }).then((sell) => {
      const data = products.map((item) => {
        return {
          productId: item.product,
          quantity: item.count,
          sellId: sell.dataValues.id,
        };
      });

      return db.productSell.bulkCreate(data);
    });
  });
