import '@babel/polyfill';
import './plugins/env';
import './plugins/db';
import './middleware/kiosk';
import http from 'http';
import express from 'express';
import websocket from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import AdminRouter from './routes/admin';
import KioskRouter from './routes/kiosk';
import MobileRouter from './routes/mobile';
import { Subject } from 'rxjs';
import db from './db/models';

const app = express();
const server = http.createServer(app);
const socket = new websocket.Server({ server });
const messageEventer = new Subject();

db.sequelize.sync({ force: true });

socket.on('connection', (ws, res) => {
  messageEventer.subscribe((msg) => ws.send(msg), () => {});
});

app.use(morgan());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/admin', AdminRouter);
app.use('/kiosk', KioskRouter);
app.use('/mobile', MobileRouter(messageEventer));

const PORT = process.env.PORT || 3000;
server.listen(PORT);
