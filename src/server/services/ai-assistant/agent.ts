"server-only";

import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "./prompts";
import { buildAssistantContext } from "./context";
import { createAssistantTools } from "./tools";
import { env } from "~/env";

const model = env.OPENAI_RECOMMENDATION_MODEL;

export const streamAssistantResponse = async ({
  messages,
  userId,
}: {
  messages: UIMessage[];
  userId: number;
}) => {
  // come up with another way to build the context
  // because in a future there will be more routes and it will consume a lot of tokens
  const assistantContext = await buildAssistantContext({ userId });

  const result = streamText({
    model: openai(model),
    system: [SYSTEM_PROMPT, assistantContext].join("\n\n"),
    messages: await convertToModelMessages(messages),
    providerOptions: {
      openai: {
        store: false,
      },
    },
    tools: createAssistantTools({ userId }),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
};
