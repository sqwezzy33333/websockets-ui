import {ExtendWebSocket, TurnType} from "../models/models";
import {sendResponseMessage} from "../utils/utils";
import {MESSAGE_TYPE} from "../constants/constants";

export const turn: TurnType = async (db, room) => {
    try {
        const clients = await db.getWsClientsByRoom(room);

        if (clients) {
            clients.forEach((ws: ExtendWebSocket) => {
                const gameData = {
                    currentPlayer: room.nextTurn,
                };
                sendResponseMessage(MESSAGE_TYPE.turn, gameData, ws);
            });
        }
    } catch (error: any) {
        console.log(`TurnError. ${error.message}`);
    }
};
