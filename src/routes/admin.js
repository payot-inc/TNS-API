import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
  console.log(res.socket);

  res.send('hello world');
})

export default router;