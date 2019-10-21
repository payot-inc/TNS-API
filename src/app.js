import './plugins/env';
import './plugins/db';
import './plugins/websocket';
import './middleware/kiosk';
import http from 'http';
import express from 'express';
import websocket from './plugins/websocket';
import cors from 'cors';
import helmet from 'helmet';

import AdminRouter from './routes/admin';

const app = express();
const server = http.createServer(app);
const socket = websocket(server);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.socket = socket;
  next();
});

app.use('/admin', AdminRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT);
