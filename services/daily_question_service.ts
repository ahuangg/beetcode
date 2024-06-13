// services/scheduledMessages.ts
import { Client, TextChannel, EmbedBuilder, Embed } from "discord.js";
import cron from "node-cron";
import { ApiClient } from "../api/api-client";

interface Question {
    questionLink: string;
    date: string;
    questionId: string;
    questionFrontEndId: string;
    questionTitle: string;
    titleSlug: string;
    difficulty: string;
    isPaidOnly: boolean;
    question: string;
    exampleTestcases: string;
    topicTags: string[];
    hints: string[];
    soultions: string[];
    companyTagStats: string[];
    likes: number;
    dislikes: number;
    similarQuestions: string;
}

export class DailyQuestionService {
    private client: Client;
    private channelId: string;
    private apiClient: ApiClient;

    constructor(client: Client, apiClient: ApiClient, channelId: string) {
        this.client = client;
        this.channelId = channelId;
        this.apiClient = apiClient;
    }

    public async start() {
        const task = cron.schedule(
            "0 20 * * *",
            async () => {
                const channel = this.client.channels.cache.get(
                    this.channelId
                ) as TextChannel;
                if (channel) {
                    const data = await this.apiClient.get<Question>("/daily");

                    const parsedDescription = data.question
                        .replace(/<\/?[^>]+(>|$)/g, "")
                        .replace(/&nbsp;/g, "");

                    const embed = new EmbedBuilder()
                        .setTitle(data.questionId + ". " + data.questionTitle)
                        .setURL(data.questionLink)
                        .setDescription("Difficulty - " + data.difficulty)
                        .addFields(
                            {
                                name: "Description",
                                value: parsedDescription
                                    .split("Example 1:")[0]
                                    .trim(),
                                inline: false,
                            },
                            {
                                name: "Likes",
                                value: "" + data.likes,
                                inline: true,
                            },
                            {
                                name: "Dislikes",
                                value: "" + data.dislikes,
                                inline: true,
                            }
                        )
                        .setColor("Random")
                        .setTimestamp();
                    await channel.send({ embeds: [embed] });
                }
            },
            {
                scheduled: true,
                timezone: "America/New_York",
            }
        );
        task.start();
    }
}
