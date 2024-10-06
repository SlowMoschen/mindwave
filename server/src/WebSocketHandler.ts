import { Server } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { RoomHandler } from "./RoomHandler";
import { CustomError, SOCKET_EVENTS } from "./utils";
import { Logger } from "./middlewares/Logger";
import { JoinRoomDTO, RoomConfigurationDTO } from "./interfaces";
import { JoinRoomSchema, RoomConfigurationSchema } from "./schemas/RoomSchemas";
import { ValidateSchemaWS } from "./middlewares/DtoValidator";

export class WebSocketHandler {
  private _clients: Map<string, Socket> = new Map();
  private readonly _SocketServer: SocketServer;
  public readonly RoomHandler: RoomHandler = new RoomHandler();

  constructor(httpServer: Server) {
    this._SocketServer = new SocketServer(httpServer, { cors: { origin: "*" } });
    this.Initialize();
  }

  private Initialize() {

    // CVS Logging Middleware
    this._SocketServer.use((socket, next) => {
      socket.onAny((event) => {
        Logger.logSocketEvent(
          `${socket.id} - ${socket.handshake.address} - ${new Date().toISOString()} - ${event}`
        );
      });
      next();
    });

    this._SocketServer.on(SOCKET_EVENTS.CONNECTION, (client) => this.HandleConnection(client));
  }

  private HandleConnection(client: Socket) {
    Logger.info(`WS - Connected: ${client.id}`);
    this.AddGlobalClient(client);

    client.on(SOCKET_EVENTS.DISCONNECT, () => this.HandleDisconnect(client));

    client.on(SOCKET_EVENTS.MESSAGE, (message: string) => console.log("Message received", message));

    client.on(SOCKET_EVENTS.ROOM_EVENTS.CREATE, (data: RoomConfigurationDTO) =>
      this.HandleRoomCreation(client, data)
    );

    client.on(SOCKET_EVENTS.ROOM_EVENTS.JOIN, (data: JoinRoomDTO) =>
      this.HandleRoomJoin(client, data)
    );

    client.on(SOCKET_EVENTS.ROOM_EVENTS.LEAVE, (roomName: string) =>
      this.HandleRoomLeave(client, roomName)
    );
  }

  private HandleDisconnect(client: Socket) {
    Logger.info(`WS - Disconnected: ${client.id}`);
    this.RoomHandler.LeaveRoom("global", client);
    this.RemoveGlobalClient(client);
    client.disconnect();
  }

  private async HandleRoomCreation(client: Socket, roomData: RoomConfigurationDTO) {
    try {
      const validationError = ValidateSchemaWS(RoomConfigurationSchema, roomData);
      if (validationError) return client.emit(SOCKET_EVENTS.ERRORS[400], validationError.message);

      const room = await this.RoomHandler.CreateRoom(roomData);

      Logger.info(`WS - Room created: ${room.name} - ${room.id} - by ${client.id}`);

      client.emit(SOCKET_EVENTS.ROOM_EVENTS.CREATED, room.ConvertToPublicObject());
    } catch (error) {
      Logger.error(`WS - Error creating room: ${error}`);
      client.emit(SOCKET_EVENTS.ERRORS[500], error);
    }
  }

  private async HandleRoomJoin(client: Socket, data: JoinRoomDTO) {
    try {
      const validationError = ValidateSchemaWS(JoinRoomSchema, data);
      if (validationError) return client.emit(SOCKET_EVENTS.ERRORS[400], validationError.message);

      const room = await this.RoomHandler.JoinRoom(client, data);
      client.join(room.id);

      Logger.info(`WS - ${client.id} joined room: ${room.name} - ${room.id}`);

      client.emit(SOCKET_EVENTS.ROOM_EVENTS.JOINED, room.ConvertToPublicObject());
    } catch (error) {
      Logger.error(`WS - Error joining room: ${error}`);

      if (error instanceof CustomError) {
        client.emit(
          SOCKET_EVENTS.ERRORS[error.code as keyof typeof SOCKET_EVENTS.ERRORS],
          error.message
        );
      } else {
        client.emit(SOCKET_EVENTS.ERRORS[500], error);
      }
    }
  }

  private HandleRoomLeave(client: Socket, roomName: string) {
    this.RoomHandler.LeaveRoom(roomName, client);
    client.leave(roomName);
    Logger.info(`WS - ${client.id} left room: ${roomName}`);
  }

  public AddGlobalClient(client: Socket) {
    this._clients.set(client.id, client);
  }

  public RemoveGlobalClient(client: Socket) {
    this._clients.delete(client.id);
  }

  public NotifyGlobalAll(message: string) {
    this._clients.forEach((client) => {
      client.send(message);
    });
    Logger.warn(`WS - Broadcasted message to all clients: ${message}`);
  }

  get clientCount() {
    return this._clients.size;
  }

  get clientList() {
    return Array.from(this._clients.values());
  }
}
