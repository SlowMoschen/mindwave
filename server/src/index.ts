import cors from "cors";
import express from "express";
import { createServer } from "http";
import { WebSocketHandler } from "./WebSocketHandler";
import { ConnectionsController } from "./controllers/ConnectionsController";
import { RoomController } from "./controllers/RoomsController";
import { Logger } from "./middlewares/Logger";
import * as dotenv from "dotenv";

const app = express();
const httpServer = createServer(app);

/**
 * ############################
 * 
 *   MARK: MIDDLEWARES
 * 
 * ############################
 */

dotenv.config();
app.use(cors({
  origin: "*",
}));
app.use(express.json());
app.use((req, _, next) => {
  Logger.logHttp(`${req.method} - ${req.url} - ${req.ip} - ${new Date().toISOString()}`);
  next();
});


/**
 * ############################
 * 
 *   MARK: ROUTES
 * 
 * ############################
 */

export const SocketHandler = new WebSocketHandler(httpServer);
const connectionsController = new ConnectionsController(SocketHandler).router;
const roomController = new RoomController(SocketHandler).router;


app.use("/health", (_, res) => res.send("OK"));
app.use("/connections", connectionsController);
app.use("/rooms", roomController);


/**
 * ############################
 * 
 *   MARK: START SERVER
 * 
 * ############################
 */
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
