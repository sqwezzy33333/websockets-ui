import {ClientsType, ExtendWebSocket, ParseIncomingMessageType} from "../models/models";
import {messageRequiredFields, MESSAGE_TYPE, RANDOM_BOARD} from "../constants/constants";

export const pipeYXToIndex = (x: number, y: number, boardSize: number) => boardSize * y + x;

export const pipeIndexToXY = (index: number, boardSize: number) => {
    const x = index % boardSize;
    const y = (index - x) / boardSize;
    return { x, y };
};

export const getIndexAround = (cellIndex: number, boardSize: number) => {
    const indexes: number[] = [];

    const { x, y } = pipeIndexToXY(cellIndex, boardSize);

    [x - 1, x, x + 1].forEach((x) => {
        if (x >= 0 && x < boardSize) {
            [y - 1, y, y + 1].forEach((y) => {
                if (y >= 0 && y < boardSize) {
                    indexes.push(y * boardSize + x);
                }
            });
        }
    });

    return indexes.filter((n) => n >= 0 && n !== cellIndex);
};

export const parseIncomingMessage: ParseIncomingMessageType = (incomingMessage) => {
    try {
        const message = JSON.parse(incomingMessage.toString());

        if (messageRequiredFields) {
            messageRequiredFields.forEach((field) => {
                if (!(field in message)) throw new Error(`Message hasn't ${field}`);

            });
        }

        return message;
    } catch (error) {
        throw new Error('Incorrect incoming message.');
    }
};

export const parseIncomingData = (incomingData: string) => {
    try {
        const data = JSON.parse(incomingData);
        return data;
    } catch (error) {
        throw new Error('Incorrect incoming data.');
    }
};

export const sendResponseMessage = (
    messageType: string,
    responseData: object,
    ws: WebSocket | ExtendWebSocket | undefined
) => {
    if (!ws) return;

    const response = JSON.stringify({
        type: messageType,
        data: JSON.stringify(responseData),
        id: 0,
    });

    ws.send(response);
};

export const sendResponseMessageToAll = (
    messageType: string,
    responseData: object,
    clients: ClientsType
) => {
    const response = JSON.stringify({
        type: messageType,
        data: JSON.stringify(responseData),
        id: 0,
    });

    clients.forEach((_, ws) => {
        ws.send(response);
    });
};

export const getRandomNum = (fromInclude: number, toInclude: number) => {
    const min = Math.ceil(fromInclude);
    const max = Math.floor(toInclude);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomAttackIndex = (attacked: number[], maxIndex: number) => {
    let randomIndex: number;

    while (true) {
        const random = getRandomNum(0, maxIndex);

        if (!attacked.includes(random)) {
            randomIndex = random;
            break;
        }
    }
    return randomIndex;
};

export const getRandomBoard = () => {
    const randomIndex = getRandomNum(0, RANDOM_BOARD.length - 1);
    return RANDOM_BOARD[randomIndex];
};

const ids: string[] = [];

export function generateId() {
    function getNew () {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        if(ids.includes(result)) {
            return getNew();
        }
        ids.push(result);
        return result;
    }
    return getNew();
}
