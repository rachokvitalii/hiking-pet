"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Card, CardContent } from "~/components/ui/card";
import { getChatErrorMessage } from "~/features/assistant/utils";

import { AssistantHeader } from "./assistant-header";
import { AssistantInput } from "./assistant-input";
import { AssistantMessages } from "./assistant-messages";

export function AssistantChat() {
  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = useState("");
  const isPending = status !== "ready";
  const errorMessage = getChatErrorMessage(error);

  const submitMessage = (text: string) => {
    const nextMessage = text.trim();

    if (!nextMessage || isPending) {
      return;
    }

    clearError();
    void sendMessage({ text: nextMessage });
    setInput("");
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-4">
      <Card className="bg-card/95 overflow-hidden py-0 shadow-lg">
        <AssistantHeader isPending={isPending} />

        <CardContent className="flex min-h-[calc(100vh-18rem)] flex-col px-0">
          <AssistantMessages
            messages={messages}
            isPending={isPending}
            onSuggestionSelect={setInput}
          />

          <AssistantInput
            input={input}
            status={status}
            isPending={isPending}
            errorMessage={errorMessage}
            onInputChange={setInput}
            onSubmit={submitMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
