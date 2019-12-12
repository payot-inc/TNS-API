import { Router } from 'express';
import db from '../db/models';
import numeral from 'numeral';
import { chain } from 'lodash';

const router = Router();

// 재고정보 불러오기 & 업데이트
router.put('/products', async (req, res, next) => {
  let params = req.body;
  // console.log(params);
  params = params.filter(({ machine }) => Number(machine) <= 30);
  const ids = params.map(({ machine, product }) => {
    return `${machine}${product}`;
  });

  // 업데이트 조회
  const updateRows = params.map(({ machine, product, count }) => {
    return { id: `${machine}${product}`, count };
  });

  const machinesIds = chain(params)
    .map('machine')
    .uniq()
    .sort()
    .value();

  await Promise.all(
    machinesIds.map((id) => {
      return db.machine.findOrCreate({ where: { id }, defaults: { id, name: `${numeral(id).format('000')} 자판기`, isBroken: false } });
    }),
  );

  await Promise.all(
    updateRows.map(({ id, count }) => {
      const machineId = id.substring(0, 3);
      return db.product
        .findOrCreate({
          where: { id },
          defaults: { count, name: `상품 ${id}`, image: '', price: 1000, machineId },
        })
        .spread(async (product, created) => {
          if (created) return product;
          await product.update({ count });
          return product;
        });
    }),
  ).catch(console.log);

  const resultRows = await db.product.findAll({
    where: { id: ids },
    // includes: { model: db.machine, where: { isBroken: false } },
    raw: true,
  });
  // const resultRows = await db.machine.findAll({
  //   where: { isBroken: false },
  //   include: [{ model: db.product }],
  //   raw: true,
  //   nest: true,
  // });
  // console.log(resultRows);
  // const result = chain(resultRows)
  //   .map(({ products }) => products)
  //   .flatten()
  //   .value();
  // // console.log(result);
  res.json(resultRows);
});

router.get('/products', async (req, res, next) => {
  const resultArray = await db.machine.findAll({ where: { isBroken: false }, attributes: [], include: [{ model: db.product }], raw: true, nest: true });
  res.json(resultArray.map(({ products }) => products));
});

// 코인정보 업데이트
router.put('/coins', async (req, res, next) => {
  let coins = await db.kiosk.findOne();
  if (!coins) {
    await db.kiosk.create(req.body);
    res.json({ status: true, data: coins });
  } else {
    await coins.update(req.body);
    res.json({ status: true, data: coins });
  }
});

// 장비 고장 등록
router.post('/machine/error', async (req, res, next) => {
  const machines = req.body;
  // const vendingMachineIds = machines
  //   .filter((n) => n < 900)
  //   .map((n) => {
  //     return numeral(n).format('000');
  //   });
  // const systemMachine = machines
  //   .filter((n) => n >= 900)
  //   .map((n) => {
  //     return { 900: '코인메카', 910: '지폐기' }[n];
  //   });

  console.log(machines);

  // 오류사항 적용
  await Promise.all(machines.map(({ id, isBroken }) => db.machine.update({ isBroken }, { where: { id } })));

  // 오류 등록
  await db.machine.update({ isBroken: true }, { where: { id: vendingMachineIds } });
  // 업데이트의 내용이 고장 등록이라면
  const isBrokenUpdate = machines.every(({ isBroken }) => isBroken === true);
  if (isBrokenUpdate) {
    // 고장등록이 된다면
    const devices = machine
      .map(({ id }) => id)
      .map((id) => {
        if (Number(id) < 900) {
          return `${id}자판기`;
        }

        if (Number(id) === 900) {
          return '코인메카';
        } else if (Number(id) === 910) {
          return '지폐기';
        } else {
          return `${id}자판기`;
        }
      });
    // 고장내용
    const reason = JSON.stringify(devices);
    const smsMessage = `아래 장치들의 동작이상이 감지되었습니다\n${devices.join(',')}`;
    await db.machineError.create({ reason, smsMessage });

    const { phone } = await db.user.findOne({ attributes: ['phone'] });
    // SMS 전송
  }

  res.json(machines);
});

// 결제 처리
router.post('/pay', async (req, res, next) => {
  const { method, amount, products, returnCoin } = req.body;
  const productIds = products.map(({ id }) => id);
  const row = await db.sell.create({ method, amount, products: productIds, change: returnCoin });

  res.json(row);
});

export default router;
