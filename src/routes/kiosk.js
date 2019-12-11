import { Router } from 'express';
import db from '../db/models';
import numeral from 'numeral';
import { chain } from 'lodash';

const router = Router();

// 재고정보 불러오기 & 업데이트
router.put('/products', async (req, res, next) => {
  let params = req.body;
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
    raw: true,
  });

  res.json(resultRows);
});

// 코인정보 업데이트
router.put('/coins', async (req, res, next) => {
  console.log(req.body);
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
  const vendingMachineIds = machines
    .filter((n) => n < 900)
    .map((n) => {
      return numeral(n).format('000');
    });
  const systemMachine = machines
    .filter((n) => n >= 900)
    .map((n) => {
      return { 900: '코인메카', 910: '지폐기' }[n];
    });

  // 오류 등록
  await db.machine.update({ isBroken: true }, { where: { id: vendingMachineIds } });

  const vendingMachine = await db.machine.findAll({ where: { id: vendingMachineIds }, attributes: ['id', 'name'], raw: true });

  // 고장 장비이름 목록
  const errorMachines = [...vendingMachine.map(({ name }) => name), ...systemMachine];
  await db.machineError.create({
    reason: `${errorMachines.join(', ')} 에서 오류 발생`,
    sms: '아래 장치의 오류로 판매가 중지되었습니다',
  });

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
