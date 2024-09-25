import { Logger } from "../middlewares/Logger";
import { convertFromDirectory } from "joi-to-typescript";

async function GenerateInterfaces() {
    Logger.info("Generating interfaces...");

    const result = await convertFromDirectory({
        schemaDirectory: "src/schemas",
        typeOutputDirectory: "src/interfaces",
        debug: true,
    });

    return result ? Logger.info("Interfaces generated successfully!") : Logger.error("Error generating interfaces");
}
GenerateInterfaces();