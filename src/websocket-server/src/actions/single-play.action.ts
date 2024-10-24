import {ControllerType} from "../models/models";
import {updateWinners} from "./update-winners.action";
import {createGame} from "./create-game.action";

export const singlePlay: ControllerType = async (db, _incomingMessage, ws) => {
    if (!ws) return;

    await updateWinners(db);

    const room = await db.addRoom(ws);

    if (room) {
        const { roomId } = room;
        await createGame(db, room);
        await db.addBotToRoom(roomId);
    }
};
