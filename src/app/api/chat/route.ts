import { safeValidateUIMessages, type InferUITools, type UIMessage } from "ai";
import { getCurrentUser } from "~/server/auth/utils";
import { streamAssistantResponse } from "~/server/services/ai-assistant/agent";
import { createAssistantTools } from "~/server/services/ai-assistant/tools";

const MAX_REQUEST_BYTES = 200_000;
const MAX_MESSAGES = 30;
const MAX_TOTAL_TEXT_CHARS = 24_000;

type AssistantTools = ReturnType<typeof createAssistantTools>;
type AssistantUIMessage = UIMessage<
  unknown,
  never,
  InferUITools<AssistantTools>
>;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const userId = Number(user?.id);

  if (!Number.isInteger(userId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  const requestBytes = contentLength ? Number(contentLength) : null;

  if (
    requestBytes !== null &&
    Number.isFinite(requestBytes) &&
    requestBytes > MAX_REQUEST_BYTES
  ) {
    return createChatErrorResponse("Chat request is too large", 413);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return createChatErrorResponse("Invalid JSON request body", 400);
  }

  const messagesInput = getMessagesInput(body);
  const tools = createAssistantTools({ userId });
  const validationResult = await safeValidateUIMessages<AssistantUIMessage>({
    messages: messagesInput,
    tools,
  });

  if (!validationResult.success) {
    return createChatErrorResponse("Invalid chat messages", 400);
  }

  const messages = validationResult.data;

  if (messages.length === 0) {
    return createChatErrorResponse("Chat messages are required", 400);
  }

  if (messages.length > MAX_MESSAGES) {
    return createChatErrorResponse("Too many chat messages", 400);
  }

  if (getTotalTextLength(messages) > MAX_TOTAL_TEXT_CHARS) {
    return createChatErrorResponse("Chat messages are too long", 400);
  }

  try {
    return await streamAssistantResponse({ messages, userId });
  } catch {
    return createChatErrorResponse("Assistant is temporarily unavailable", 500);
  }
}

function getMessagesInput(body: unknown) {
  if (!body || typeof body !== "object" || !("messages" in body)) {
    return undefined;
  }

  return body.messages;
}

function getTotalTextLength(messages: AssistantUIMessage[]) {
  return messages.reduce((total, message) => {
    return (
      total +
      message.parts.reduce((messageTotal, part) => {
        return messageTotal + (part.type === "text" ? part.text.length : 0);
      }, 0)
    );
  }, 0);
}

function createChatErrorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
