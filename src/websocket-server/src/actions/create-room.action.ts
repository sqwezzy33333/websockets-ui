import {ControllerType} from "../models/models";
import {updateRoom} from "./update-room.action";

export const createRoom: ControllerType = async (db, _incomingMessage, ws) => {
    try {
        if (!ws) return;

        const room = await db.addRoom(ws);

        if (room) {
            await updateRoom(db);
        }

        if (!room) {
            console.log('User already create a room.');
        }
    } catch (error: any) {
        console.log(`CreateRoomError. ${error.message}`);
    }
};
