import { Subject } from 'rxjs';
import { Server } from 'ws';

export const event = new Subject();

export default function websocket(server) {
  const wss = new Server({
    server,
  });

  wss.on('connection', (ws, req) => {
    console.log('websocket is opend');

    ws.on('message', (message) => {
      event.next(JSON.parse(message));
    });
  });

  return wss;
}
