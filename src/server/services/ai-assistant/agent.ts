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
  const assistantContext = await buildAssistantContext({
    routeSearchQuery: getRouteSearchQuery(messages),
    userId,
  });

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

function getRouteSearchQuery(messages: UIMessage[]) {
  return messages
    .slice(-6)
    .map((message) => {
      const text = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text.trim())
        .filter(Boolean)
        .join("\n");

      return text ? `${message.role}: ${text}` : null;
    })
    .filter((text): text is string => text !== null)
    .join("\n\n");
}
