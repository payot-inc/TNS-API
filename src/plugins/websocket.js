import { Subject } from 'rxjs';
import { Server } from 'ws';

export const event = new Subject();

export const client = {};

// export default function websocket(server) {
//   const wss = new Server({
//     server,
//   });

//   wss.on('connection', (ws, req) => {
//     console.log('websocket is opend');
//     ws.on('message', (message) => {
//       event.next(JSON.parse(message));
//     });
//   });
// }

const wss = (server) => new Server({ server });

export default {
  wss,
  client: () => {
    return new Promise((resolve, reject) => {
      wss.on('connection', (ws, req) => {
        resolve(ws);
      });
      wss.on('error', (err) => reject(new Error(err.toString())));
      wss.on('close', () => {
        reject(new Error('연결이 종료됨'));
      });
    });
  },
};
