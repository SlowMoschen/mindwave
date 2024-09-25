import Joi from "joi";

export const ClientSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
}).meta({ className: "ClientDTO" });