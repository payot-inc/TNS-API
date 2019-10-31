import { Router } from 'express';
import moment from 'moment';

const router = Router();

// 장비 목록 조회
router.get('/machines', async (req, res, next) => {
  const list = await db.machine.findAll({ include: { model: db.product } });
  res.json(list);
});

// 장비 정보 변경
router.put('/machines', async (req, res, next) => {
  const machines = req.body;
  await Promise.all(
    machines.map(({ id, ...params }) => {
      return db.machine.update(params, { where: id });
    }),
  );
  res.redirect('/admin/machines');
});

// 장비 삭제
router.delete('/machine/:id', async (req, res, next) => {
  const { id } = req.params;
  await db.machine.destroy({ where: { id } });
  res.redirect('/admin/machines');
});

// 상품 목록 가져오기
router.get('/products', async (req, res, next) => {
  const rows = await db.product.findAll({ raw: true });
  res.json(rows);
});

// 상품 업데이트
router.put('/products', async (req, res, next) => {
  const products = req.body;
  await Promise.all(
    products.map(({ id, ...params }) => {
      return db.product.update(params, { where: { id } });
    }),
  );
  res.json({ success: true });
});

// 상품 삭제
router.delete('/product/:id', async (req, res, next) => {
  await db.product.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/products');
});

// 결제내역 가져오기
router.get('/sales', async (req, res, next) => {
  const { start = Date.now(), end = Date.now(), page = 1, limit = 10 } = req.query;
  const list = await db.sell.findAndCountAll({
    where: {
      createdAt: {
        [Op.between]: [
          moment(start)
            .startOf('day')
            .toDate(),
          moment(end)
            .endOf('day')
            .toDate(),
        ],
      },
    },
    attributes: ['id', 'amount', 'method', 'products', 'createdAt'],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    raw: true,
  });

  res.json(list);
});

// 일자별 결제내역 가져오기
router.get('/sales/day', async (req, res, next) => {
  const { start = Date.now(), end = Date.now() } = req.query;
  const list = await db.sell.findAll({
    where: {
      createdAt: {
        [Op.between]: [
          moment(start)
            .startOf('day')
            .toDate(),
          moment(end)
            .endOf('day')
            .toDate(),
        ],
      },
    },
    group: [[sequelize.fn('DATE', sequelize.col('createdAt'))]],
    attributes: [[sequelize.fn('COUNT', sequelize.col('amount')), 'count'], [sequelize.fn('SUM', sequelize.col('amount')), 'amount'], [sequelize.fn('DATE', sequelize.col('createdAt')), 'createdAt']],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true,
  });

  res.json(list);
});

// 단일 상세 결제내역 조회
router.get('/sale/:id', async (req, res, next) => {
  const { id } = req.params;
  let saleData = await db.sell.findOne({ where: { id }, attributes: { exclude: ['updatedAt'] }, raw: true });
  const products = await db.product.findAll({
    where: { id: saleData.products },
    include: [{ model: db.machine, attributes: [], }],
    attributes: ['id', [sequelize.col('machine.name'), 'machineName'], 'name', 'price'],
  });

  saleData.products = products;
  res.json(saleData);
});

// 장비 고장 내역 가져오기
router.get('/machines/broken', async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const results = await db.machineError.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    raw: true,
  });

  res.json(results);
});

export default router;
