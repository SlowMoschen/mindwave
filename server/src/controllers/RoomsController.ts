import { Request, Response } from 'express';
import { SocketHandler } from '..';
import { WebSocketHandler } from '../WebSocketHandler';
import { ControllerBase } from './ControllerBase';

export class RoomController extends ControllerBase {

    constructor(socketHandler: WebSocketHandler) {
        super(socketHandler);
    }

    protected initializeRoutes(): void {
        this.router.get('/', this.GET_AllRooms.bind(this));
        this.router.get('/:roomName', this.GET_SingleRoom.bind(this));
    }

    private GET_AllRooms(req: Request, res: Response): void {
        const rooms = this._SocketHandler.RoomHandler.GetAllRooms();
        res.json(rooms);
    }

    private GET_SingleRoom(req: Request, res: Response): void {
        const room = SocketHandler.RoomHandler.GetRoom(req.params.roomName);

        if (!room) {
            res.status(404).json({ message: 'Room not found' });
            return;
        }

        res.json(room);
    }
}