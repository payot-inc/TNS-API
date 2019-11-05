import '@babel/polyfill';
import './plugins/env';
import './plugins/db';
// import './plugins/websocket';
import './middleware/kiosk';
import http from 'http';
import express from 'express';
// import websocket from './plugins/websocket';
import websocket from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import AdminRouter from './routes/admin';
import KioskRouter from './routes/kiosk';
import MobileRouter from './routes/mobile';
import { Subject } from 'rxjs';

const app = express();
const server = http.createServer(app);
const socket = new websocket.Server({ server });
const messageEventer = new Subject();

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
// app.use('/mobile', (req, res, next) => {
//   socket.once('connection', (ws, request) => {
//     console.log('connect');
//     req.ws = ws;
//     next();
//   });
// });

socket.once('connection', (ws, res) => {
  console.log(ws);
});

app.use('/mobile', MobileRouter(messageEventer));

const PORT = process.env.PORT || 3000;
server.listen(PORT);
