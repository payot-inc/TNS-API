import { Router } from 'express';
import db from '../db/models';
import numeral from 'numeral';
import { chain } from 'lodash';
import axios from 'axios';

const router = Router();
const client = axios.create({
  baseURL: 'https://alimtalk-api.bizmsg.kr',
  headers: {
    'Content-Type': 'application/json',
    userid: 'payot',
  },
});

async function sendSMS(phone, message) {
  try {
    const params = [
      {
        phn: phone,
        message_type: 'ft',
        msg: message,
        smsKind: 'L',
        smsSender: '07078076857',
        msgSms: message,
        reserveDt: '00000000000000',
        profile: '9425b9c1b0dced8bfb189d54556f969fdfaa49ad',
      },
    ];

    client
      .post('/v2/sender/send', params)
      .then(({ data }) => console.log(data))
      .catch(console.log);
  } catch (error) {
    console.log(error);
  }
}

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
  res.json({ status: true });
});

// 동전 들어오는 로그
router.post('/input/coin', async (req, res, next) => {
  const { amount } = req.body;
  const params = {
    amount: Number(amount),
    createdAt: new Date(),
  };
  const createInputCoin = await db.coin.create(params);

  res.json(createInputCoin);
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

  const filterMachine = machines.filter(({ id }) => Number(id.slice(0, 2)) < 90);
  // 오류사항 적용
  await Promise.all(
    filterMachine
      .map(({ id, isBroken }) => ({
        id: numeral(id.slice(0, 2)).format('000'),
        isBroken,
      }))
      .map(({ id, isBroken }) => db.machine.update({ isBroken }, { where: { id } })),
  );

  // 오류 등록
  // 업데이트의 내용이 고장 등록이라면
  const isBrokenUpdate = machines.every(({ isBroken }) => isBroken === true);
  if (isBrokenUpdate) {
    // 고장등록이 된다면
    const devices = machines
      .map(({ id }) => id)
      .map((id) => {
        return { id: Number(id.slice(0, 2)), reasonCode: Number(id.slice(2, id.length)) };
      })
      .map(({ id, reasonCode }) => {
        switch (id) {
          case 91:
            const cashMachineError = ['미연결', '통신오류', '식별부이상', '지폐걸림', '지폐불출이상'][reasonCode];
            return `지페식별기 (${cashMachineError})`;
          case 90:
            const coinMecaError = ['미연결', '통신오류', '셀렉터이상', '불출이상'][reasonCode];
            return `코인메카니즘 (${coinMecaError})`;
          default:
            const vendingMachineError = ['미연결', '재고데이터이상', 'I/M미연결', 'I/M통신오류', '재고없음'][reasonCode];
            return `${id}자판기 (${vendingMachineError})`;
        }
      });
    // 고장내용
    const reason = JSON.stringify(devices);
    const smsMessage = `아래 장치들의 동작이상이 감지되었습니다\n\n${devices.join(',\n')}`;
    await db.machineError.create({ reason, sms: smsMessage });

    const { phone } = await db.user.findOne({ attributes: ['phone'] });
    // SMS 전송
    const phoneNumber = phone.replace(/^010/, '8210').replace(/-/g, '');
    await sendSMS(phoneNumber, smsMessage);
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
