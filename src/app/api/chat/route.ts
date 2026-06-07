import type { UIMessage } from "ai";
import { getCurrentUser } from "~/server/auth/utils";
import { generateAssistantResponse } from "~/server/services/ai-assistant/agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const userId = Number(user?.id);

  if (!Number.isInteger(userId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json() as { messages: UIMessage[] };

  const response = await generateAssistantResponse({ messages, userId });

  return response;
}
