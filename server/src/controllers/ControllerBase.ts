import { Router } from "express";
import { WebSocketHandler } from "../WebSocketHandler";

export abstract class ControllerBase {
    public router = Router();
    protected readonly _SocketHandler: WebSocketHandler;

    constructor(socketHandler: WebSocketHandler) {
        this._SocketHandler = socketHandler;
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;
}