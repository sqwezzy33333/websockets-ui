import WebSocket, {WebSocketServer} from 'ws';
import {userController} from "../user-controller/user-controller";
import {AuthRequestUser} from "../models";

export class WsController {
    server!: WebSocketServer;
    ws!: WebSocket;

    createWsServer() {
        this.server = new WebSocketServer({
            port: 1234
        });

        this.server.on('connection', (ws) => {
            this.ws = ws;
            ws.on('message', this.serverListener)
        })
    }

    serverListener = (message: string) => {
        const parseMessage = JSON.parse(message);
        parseMessage.data = JSON.parse(parseMessage.data);

        if (parseMessage.type === 'reg') {
            userController.setWebSocket(this.ws).checkUser(parseMessage as AuthRequestUser).then();
        }
    }
}

