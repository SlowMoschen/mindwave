import { Request, Response } from "express";
import { SocketHandler } from "..";
import { WebSocketHandler } from "../WebSocketHandler";
import { ControllerBase } from "./ControllerBase";

export class ConnectionsController extends ControllerBase {

  constructor(socketHandler: WebSocketHandler) {
    super(socketHandler);
  }

  protected initializeRoutes(): void {
    this.router.get("/", this.GET_AllConnections.bind(this));
    this.router.get("/:id", this.GTE_SingleConnection.bind(this));
  }

  private GET_AllConnections(_: Request, res: Response): void {
    const clients = this._SocketHandler.clientList.map((client) => {
      return {
        id: client.id,
        connected: client.connected,
      };
    });

    res.json(clients);
  }

  private GTE_SingleConnection({ params }: Request, res: Response): void {
    const client = SocketHandler.clientList.find((client) => client.id === params?.id);

    if (!client) {
      res.status(404).json({ message: "Client not found" });
      return;
    }

    res.json({
      id: client.id,
      connected: client.connected,
    });
  }
}
