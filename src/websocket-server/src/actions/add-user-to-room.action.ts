import {ControllerType, RoomDataType} from "../models/models";
import {parseIncomingData} from "../utils/utils";
import {updateRoom} from "./update-room.action";
import {createGame} from "./create-game.action";

export const getRoomData = (roomData: unknown) => {
    try {
        const { indexRoom } = roomData as RoomDataType;
        if (!indexRoom) throw Error("Name isn't defined");
        return { indexRoom };
    } catch {
        throw new Error('Incorrect room data');
    }
};

export const addUserToTheRoom: ControllerType = async (db, incomingMessage, ws) => {
    try {
        if (!ws) return;

        const parsedData = parseIncomingData(incomingMessage.data);
        const { indexRoom } = getRoomData(parsedData);

        const room = await db.addUserToTheRoom(ws, indexRoom);

        if (room) {
            await createGame(db, room);
            await updateRoom(db);
        }

        if (!room) {
            console.log('Waiting for another user to join room.');
        }
    } catch (error: any) {
        console.log(`UpdateRoomError. ${error.message}`);
    }
};
