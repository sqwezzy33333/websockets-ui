import {BoardType, ControllerType, GameDataType, ShipType} from "../models/models";
import {getIndexAround, parseIncomingData, pipeYXToIndex} from "../utils/utils";
import {BOARD_SIZE} from "../constants/constants";
import {startGame} from "./start-game.action";
import {turn} from "./turn.action";

const createBoard = (ships: ShipType[]) => {
    const board: BoardType = {
        ships: [],
        attacked: [],
    };

    ships.forEach((ship) => {
        const {
            position: { x, y },
            direction,
            length,
        } = ship;

        const shipIndexes: number[] = [];
        const aroundShipIndexes: number[] = [];
        const firstIndex = pipeYXToIndex(x, y, BOARD_SIZE);

        shipIndexes.push(firstIndex);

        if (direction) {
            for (let i = 1; i < length; i++) {
                shipIndexes.push(firstIndex + BOARD_SIZE * i);
            }
        }

        if (!direction) {
            for (let i = 1; i < length; i++) {
                shipIndexes.push(firstIndex + i);
            }
        }

        shipIndexes.forEach((cell) => {
            aroundShipIndexes.push(...getIndexAround(cell, BOARD_SIZE));
        });

        const unique = [...new Set(aroundShipIndexes)].filter((index) => !shipIndexes.includes(index));

        board.ships.push({
            ship: shipIndexes,
            aroundShip: unique,
        });
    });

    return board;
};

export const addShips: ControllerType = async (db, incomingMessage, ws) => {
    try {
        if (!ws) {
            return;
        }

        const parsedData = parseIncomingData(incomingMessage.data) as GameDataType;
        const { ships, gameId } = parsedData;
        const { userIndex } = ws;

        const board = createBoard(ships);

        const room = await db.getRoomByID(gameId);

        if (!room) {
            return console.log('AddShipsError. Room not found');
        }

        const roomWithBoard = await db.addRoomBoardByUserIndex(gameId, userIndex, board, parsedData);

        if (!roomWithBoard) {
            return console.log('AddShipsError. Room not found');
        }

        if (roomWithBoard && Object.keys(roomWithBoard.game).length === 2) {
            await startGame(db, roomWithBoard);
            await turn(db, roomWithBoard);
        }
    } catch (error: any) {
        console.log(`AddShipsError. ${error.message}`);
    }
};
