import { io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000", { autoConnect: false });

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [clients, setClients] = useState([]);
  const [currentRoom, setCurrentRoom] = useState<{
    name: string;
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
      console.error("Invalid data", error);
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
      password: formData.get("password") ?? undefined,
      victoryThreshold: formData.get("victoryThreshold") as unknown as number,
      language: formData.get("language") as string,
    };

    socket.emit("room:create", body);
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

      <div>
        <h1>Rooms</h1>
        <ul>
          {rooms.map((room: any) => {
            const isInRoom = room.clients.includes(socket.id);
            if (isInRoom) return;

            return (
              <li key={room.name}>
                <h2>{room.name}</h2>
                <p>Created at: {room.createdAt}</p>
                <p>Client count: {room.clientCount}</p>
                <div>
                  <ul>
                    {room.clients.map((client: any) => (
                      <li key={client}>{client}</li>
                    ))}
                  </ul>
                </div>
                <li
                  onClick={() => handleRoomJoin(room.name)}
                >
                  Join Room
                </li>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h1>Room Clients</h1>
        <ul>
          {roomClients.map((client: any) => (
            <li key={client}>{client}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
