import {parseIncomingData, sendResponseMessage} from "../utils/utils";
import {updateWinners} from "./update-winners.action";
import {MESSAGE_TYPE} from "../constants/constants";
import {ControllerType, RegUserDataType} from "../models/models";
import {updateRoom} from "./update-room.action";


const getUserRegData = (userData: unknown) => {
    try {
        const { name, password } = userData as RegUserDataType;
        if (!name) throw Error("Name isn't defined");
        if (!password) throw Error("Password isn't defined");
        return { name, password };
    } catch {
        throw new Error('Incorrect user reg data');
    }
};

export const regUser: ControllerType = async (db, incomingMessage, ws) => {
    if (!ws) return;
    const responseData = {
        name: '',
        index: -1,
        error: false,
        errorText: '',
    };

    try {
        const parsedData = parseIncomingData(incomingMessage.data);
        const { name, password } = getUserRegData(parsedData);

        responseData.name = name;

        const userInDb = await db.findUserByUsername(name);

        if (userInDb) {
            const { index, password: userInDbPassword } = userInDb;

            responseData.index = index;
            ws.userIndex = index;
            ws.userName = name;

            if (userInDbPassword !== password) {
                responseData.error = true;
                responseData.errorText = 'Incorrect login or password';
            }
        }

        if (!userInDb) {
            const { index } = await db.addUser(name, password);
            responseData.index = index;
            ws.userIndex = index;
            ws.userName = name;
        }

        sendResponseMessage(MESSAGE_TYPE.reg, responseData, ws);

        if (!responseData.error) {
            await updateWinners(db);
            await updateRoom(db);
        }
    } catch (error: any) {
        responseData.errorText = error.message;
        sendResponseMessage(MESSAGE_TYPE.reg, responseData, ws);
    }
};
