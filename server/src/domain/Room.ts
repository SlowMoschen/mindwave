import { Socket } from "socket.io";
import { RoomDTO, RoomLanguage } from "../interfaces";

export class Room {
  public name: string;
  public readonly createdAt: Date;
  private readonly _clientCollection: Map<
    string,
    {
      name: string;
      client: Socket;
    }
  > = new Map();
  private _clientCount: number = this._clientCollection.size;
  public password?: string;
  public language: RoomLanguage;
  public victoryThreshold: number;

  constructor(name: string, language: RoomLanguage, winCondition: number, password?: string) {
    this.name = name;
    this.createdAt = new Date();
    this.password = password;
    this.language = language;
    this.victoryThreshold = winCondition;
  }

  public AddClient(client: Socket, name: string) {
    this._clientCollection.set(client.id, { name, client });
    this._clientCount = this._clientCollection.size;
  }

  public RemoveClient(client: Socket) {
    this._clientCollection.delete(client.id);
    this._clientCount = this._clientCollection.size;
  }

  public NotifyAll(message: string) {
    this._clientCollection.forEach((socketInfo) => {
      socketInfo.client.send(message);
    });
  }

  public IsUsernameAvailable(name: string): boolean {
    return !Array.from(this._clientCollection.values()).some((socketInfo) => socketInfo.name === name);
  }

  public ConvertToPublicObject(): RoomDTO {
    return {
      name: this.name,
      createdAt: this.createdAt,
      clientCount: this._clientCount,
      clients: Array.from(this._clientCollection.values()).map((socketInfo) => ({
        id: socketInfo.client.id,
        name: socketInfo.name,
      })),
      hasPassword: !!this.password,
      victoryThreshold: this.victoryThreshold,
      language: this.language,
    };
  }

  get clients() {
    return this._clientCollection;
  }

  get clientCount() {
    return this._clientCount;
  }
}
