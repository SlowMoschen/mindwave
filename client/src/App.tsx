import { io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000", { autoConnect: false });

const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERRORS: {
      INTERNAL: 'internal_error',
      INVALID_DATA: 'invalid_data',
      INVALID_ROOM: 'invalid_room',
      INVALID_PASSWORD: 'invalid_password',
  },
  MESSAGE: 'message',
  GAME_EVENTS: {
      START: 'game:start',
      END: 'game:end',
      NEXT: 'game:next',
      READY: 'game:ready',
  },
  ROOM_EVENTS: {
      CREATE: 'room:create',
      JOIN: 'room:join',
      LEAVE: 'room:leave',
      CREATED: 'room:created',
      JOINED: 'room:joined',
  }
};

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [clients, setClients] = useState([]);
  const [currentRoom, setCurrentRoom] = useState<{
    name: string;
    id: string;
    createdAt: Date;
    clientCount: number;
    clients: {
      id: string;
      name: string;
    }[];
    hasPassword: boolean;
    victoryThreshold: number;
    language: string;
  }>();
  const [rooms, setRooms] = useState([]);
  const [roomClients, setRoomClients] = useState([]);

  const fetchRooms = async () => {
    const response = await fetch("http://localhost:3000/rooms");
    const data = await response.json();
    console.log(data);
    setRooms(data);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("joined", (data) => {
      console.log("Joined room", data);
      setCurrentRoom(data);
    });

    socket.on("internal_error", (error) => {
      console.error("Error", error);
    });

    socket.on("invalid_data", (error) => {
      console.error("Invalid data:", error);
    });

    socket.on(SOCKET_EVENTS.ROOM_EVENTS.CREATED, (room) => {
      console.log("Room created", room);
      socket.emit(SOCKET_EVENTS.ROOM_EVENTS.JOIN, { roomID: room.id, playerName: "Test" });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleConnect = () => {
    socket.connect();
  };

  const handleDisconnect = () => {
    socket.disconnect();
  };

  const sendMessage = () => {
    socket.emit("message", "Hello from client!");
  };

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("roomName") as string,
      password:
        (formData.get("password") as string) === ""
          ? undefined
          : (formData.get("password") as string),
      victoryThreshold: formData.get("victoryThreshold") as unknown as number,
      language: formData.get("language") as string,
    };

    socket.emit(SOCKET_EVENTS.ROOM_EVENTS.CREATE, body);
    e.currentTarget.reset();
  };

  const handleRoomJoin = (roomName: string) => {
    socket.emit("room:join", { roomName, playerName: "Test" });
  };

  return (
    <>
      <h1>Socket.io Client</h1>
      <h2>Status: {isConnected ? "Connected" : "Disconnected"}</h2>
      <h2>Socket ID: {socket.id}</h2>
      <div>
        <h2>Current Room:</h2>
        <p>{currentRoom?.name ?? ""}</p>
        <p>{currentRoom?.createdAt.toLocaleString() ?? ""}</p>
        <ul>
          {currentRoom?.clients.map((client) => (
            <li key={client.id}>{client.id}</li>
          ))}
        </ul>
      </div>

      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleDisconnect}>Disconnect</button>

      <button onClick={sendMessage}>Send Message</button>
      <button onClick={fetchRooms}>Fetch Rooms</button>

      <ul>
        {clients.map((client: any) => (
          <li key={client.id}>{client.id}</li>
        ))}
      </ul>

      <form className="flex flex-col m-5" onSubmit={(e) => handleJoinRoom(e)}>
        <h1>Create Room</h1>
        <label htmlFor="roomName">Name</label>
        <input type="text" name="roomName" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" />
        <label htmlFor="victoryThreshold">Winstreak</label>
        <div className="flex m-5">
          <label htmlFor="victoryThreshold" className="flex m-5">
            3
            <input type="radio" name="victoryThreshold" value="3" defaultChecked />
          </label>
          <label htmlFor="victoryThreshold" className="flex m-5">
            5
            <input type="radio" name="victoryThreshold" value="5" />
          </label>
          <label htmlFor="victoryThreshold" className="flex m-5">
            Custom
            <input type="radio" name="victoryThreshold" />
            <input type="number" name="victoryThreshold" />
          </label>
        </div>
        <label htmlFor="language">Language</label>
        <select name="language">
          <option value="de">German</option>
          <option value="en">English</option>
        </select>
        <button type="submit">Create Room</button>
      </form>
    </>
  );
}

export default App;
