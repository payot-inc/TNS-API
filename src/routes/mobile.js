import { Router } from 'express';

export default function(socket_subject) {
  const router = Router();

  router.post('/pay', async (req, res, next) => {
    const { amount } = req.body;
    const sendKioskMessage = {
      type: 'pay',
      amount: Number(amount),
    };

    socket_subject.next(JSON.stringify(sendKioskMessage));

    res.json({ sucess: true });
  });

  return router;
}
