import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function getChatErrorMessage(error: Error | undefined) {
  if (!error) {
    return null;
  }

  try {
    const parsed = JSON.parse(error.message) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof parsed.error === "string"
    ) {
      return parsed.error;
    }
  } catch {
    // Transport errors are not always JSON responses.
  }

  return error.message || "Could not send the message.";
}
