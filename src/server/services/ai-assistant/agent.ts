import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const AssistantResponseSchema = z.object({
  message: z.string(),
});

export const generateAssistantResponse = async ({ message }: { message: string }) => {
  const { output } = await generateText({
    model: openai("gpt-4o"),
    prompt: message,
    output: Output.object({
      schema: AssistantResponseSchema,
    }),
  });

  return output.message;
};