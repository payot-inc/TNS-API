import { Router } from 'express';

const router = Router();

router.post('/pay', async (req, res, next) => {
  const { amount } = req.body;
  const sendKioskMessage = {
    type: 'pay',
    amount,
  };
  req.socket.write(JSON.stringify(sendKioskMessage));

  res.json({ sucess: true });
});

export default router;
