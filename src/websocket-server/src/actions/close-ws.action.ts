import {ExtendWebSocket} from "../models/models";
import {DataBase} from "../database/database";
import {finish} from "./finish.action";

export const closeWs = async (db: DataBase, ws: ExtendWebSocket) => {
    const { userIndex } = ws;

    const rooms = await db.getRoomByUserId(userIndex);

    await Promise.all(
        rooms.map(async (room) => {
            if (room.isClosed) return;

            const winner = room.roomUsers.find(({ index }) => index !== userIndex);

            if (winner) {
                const { name } = winner;
                await finish(db, room, name);
            }
        })
    );

    await db.removeWsClient(ws);
};

