import { Socket } from "socket.io";
import { Room } from "./domain/Room";
import { Logger } from "./middlewares/Logger";
import { JoinRoomDTO, RoomConfigurationDTO, RoomDTO } from "./interfaces/RoomSchemas";
import { v4 as uuidv4 } from "uuid";

export class RoomHandler {
  private readonly _rooms: Map<string, Room> = new Map();

  constructor() {}

  public async JoinRoom(client: Socket, data: JoinRoomDTO): Promise<Room> {
    return new Promise((resolve, reject) => {
      console.log(this._rooms)
      const room = this._rooms.get(data.roomID);

      if (!room) {
        return reject("Room not found");
      }

      if (room.password && room.password !== data.password) {
        return reject("Invalid password");
      }

      if (!room.IsUsernameAvailable(data.playerName)) {
        return reject("Username already taken");
      }

      room.AddClient(client, data.playerName);
      resolve(room);
    });
  }

  public CreateRoom(data: RoomConfigurationDTO): Promise<Room> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      if (this._rooms.has(id)) {
        reject("Room already exists");
      }

      const room = new Room(id, data.name, data.language, data.victoryThreshold, data.password);
      this._rooms.set(id, room);
      resolve(room);
    });
  }

  public LeaveRoom(roomName: string, client: Socket) {
    const room = this._rooms.get(roomName);
    if (!room) return;

    room.RemoveClient(client);

    if (room.clients.size === 0) {
      this._rooms.delete(roomName);
      Logger.info(`WS - Room deleted: ${roomName}`);
    }
  }

  public GetRoom(roomName: string): RoomDTO | undefined {
    return this._rooms.get(roomName)?.ConvertToPublicObject();
  }

  public NotifyRoom(roomName: string, message: string) {
    const room = this._rooms.get(roomName);
    if (!room) return;

    room.NotifyAll(message);
    Logger.info(`WS - Broadcasted message to room ${roomName}: ${message}`);
  }

  public GetAllRooms(): RoomDTO[] {
    return Array.from(this._rooms.values()).map((room) => room.ConvertToPublicObject());
  }
}
