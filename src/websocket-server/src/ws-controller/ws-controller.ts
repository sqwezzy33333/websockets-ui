import { WebSocketServer } from 'ws';

export class WsController {
    server: null | WebSocketServer = null;

    createWsServer() {
        this.server = new WebSocketServer({
            port: 1234
        });

        this.server.on('connection', (ws) => {
            ws.on('message', this.serverListener)
        })
    }

    serverListener = (message: Buffer) => {
        const parseMessage = JSON.parse(message.toString());
        console.log(parseMessage);
    }
}

