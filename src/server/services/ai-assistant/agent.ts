import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "./prompts";
import { buildAssistantContext } from "./context";

export const generateAssistantResponse = async ({
  messages,
  userId,
}: {
  messages: UIMessage[];
  userId: number;
}) => {
  const assistantContext = await buildAssistantContext({ userId });

  const result = streamText({
    model: openai("gpt-4o"),
    system: [SYSTEM_PROMPT, assistantContext].join("\n\n"),
    messages: await convertToModelMessages(messages),
    providerOptions: {
      openai: {
        store: false,
      },
    },
  });

  return result.toUIMessageStreamResponse();
};
