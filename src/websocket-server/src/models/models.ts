import { RawData, WebSocket } from 'ws';
import {DataBase} from "../database/database";
import {messageRequiredFields} from "../constants/constants";

export type ExtendWebSocket = WebSocket & {
    id: string;
    userIndex: number;
    userName: string;
};

export type ClientsType = Map<ExtendWebSocket, undefined>;

export type UserType = {
    index: number;
    username: string;
    password: string;
};

export type KeyType = (typeof messageRequiredFields)[number];

export type ParsedIncomingMessageType = {
    [key in KeyType]: string;
};

export type ParseIncomingMessageType = (incomingMessage: RawData) => ParsedIncomingMessageType;

export type RouteType = {
    command: string;
    controller: ControllerType;
};

export type RouterType = (incomingMessage: RawData, ws: ExtendWebSocket, db: DataBase) => void;

export type ControllerType = (
    db: DataBase,
    incomingMessage: ParsedIncomingMessageType,
    ws: ExtendWebSocket | undefined
) => Promise<void>;

export type WinnerType = {
    name: string;
    wins: number;
};

export type RoomUserType = {
    name: string;
    index: number;
};

export type BoardShipType = {
    ship: number[];
    aroundShip: number[];
};

export type BoardType = {
    ships: BoardShipType[];
    attacked: number[];
};

type GameType = {
    [key: string]: BoardType;
};

export type ShipType = {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    type: string;
    length: number;
};

export type GameDataType = {
    gameId: number;
    ships: ShipType[];
    indexPlayer: number;
};

type IncomingDataType = {
    [key: string]: GameDataType;
};

export type RoomType = {
    roomId: number;
    roomUsers: RoomUserType[];
    roomCreatorIndex: number;
    nextTurn: number;
    isGameAvailableToJoin: boolean;
    isClosed: boolean;
    game: GameType;
    data: IncomingDataType;
};

export type RegUserDataType = {
    name: string;
    password: string;
};

export type RoomDataType = {
    indexRoom: number;
};

export type CreateGameType = (db: DataBase, room: RoomType) => Promise<void>;

export type StartGameType = (db: DataBase, room: RoomType) => Promise<void>;
export type TurnType = (db: DataBase, room: RoomType) => Promise<void>;


export type AttackDataType = {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
};

export type RandomAttackDataType = {
    gameId: number;
    indexPlayer: number;
};
