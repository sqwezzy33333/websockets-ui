import {WsController} from "./ws-controller/ws-controller";

export function initServer() {
    new WsController().createWsServer();
}
