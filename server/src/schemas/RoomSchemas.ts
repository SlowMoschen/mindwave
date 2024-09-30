import Joi from "joi";
import { ClientSchema } from "./ClientSchemas";

export const RoomConfigurationSchema = Joi.object({
  name: Joi.string().required().lowercase().min(3).max(20),
  language: Joi.string().required().valid("en", "de"),
  password: Joi.string().optional().min(3).max(20),
  victoryThreshold: Joi.number().required().min(1).max(10),
}).meta({ className: "RoomConfigurationDTO" });

export const JoinRoomSchema = Joi.object({
    playerName: Joi.string().required().min(3).max(20),
    roomID: Joi.string().required(),
    password: Joi.string().optional().min(3).max(20),
}).meta({ className: "JoinRoomDTO" });

export const RoomSchema = Joi.object({
    name: Joi.string().required(),
    id: Joi.string().required(),
    createdAt: Joi.date().required(),
    clientCount: Joi.number().required(),
    clients: Joi.array().items(ClientSchema).required(),
    hasPassword: Joi.boolean().required(),
    victoryThreshold: Joi.number().required(),
    language: Joi.string().required().valid("en", "de"),
}).meta({ className: "RoomDTO" });
