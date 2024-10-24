import {RouterType} from "../models/models";
import {parseIncomingMessage} from "../utils/utils";
import {ROUTES} from "../constants/constants";

export const router: RouterType = (incomingMessage, ws, db) => {
    try {
        const message = parseIncomingMessage(incomingMessage);
        const route = ROUTES[message.type];

        if (route) route.controller(db, message, ws);

        if (!route) throw Error(`Unknown message type "${message.type}".`);
    } catch (error: any) {
        console.log(`RouterError. ${error.message}`);
    }
};
