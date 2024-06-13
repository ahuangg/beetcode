import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { DailyQuestionService } from "./services/daily_question_service";
import { ApiClient } from "./api/api-client";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const apiClient = new ApiClient(process.env.API_BASE_URL || "");

const dailyQuestionService = new DailyQuestionService(
    client,
    apiClient,
    process.env.CHANNEL_ID || ""
);

client.once("ready", () => {
    dailyQuestionService.start();
});

client.login(process.env.CLIENT_ID);
