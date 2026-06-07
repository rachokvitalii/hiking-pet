"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2Icon, MountainSnowIcon, SparklesIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";

const promptSuggestions = [
  "Порадь маршрут для вихідних",
  "Що взяти в похід на день?",
  "Підбери легкий маршрут",
];

function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export default function AssistantPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = useState("");
  const isPending = status !== "ready";

  const submitMessage = (text: string) => {
    const nextMessage = text.trim();

    if (!nextMessage || isPending) {
      return;
    }

    void sendMessage({ text: nextMessage });
    setInput("");
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-4">
      <Card className="bg-card/95 overflow-hidden py-0 shadow-lg">
        <CardHeader className="border-b px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
                  <MountainSnowIcon className="size-5" />
                </div>
                <div className="grid gap-1">
                  <CardTitle className="text-xl">Hiking Assistant</CardTitle>
                  <CardDescription>
                    Routes, packing lists, and trip recommendations.
                  </CardDescription>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
                isPending
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "bg-muted/40 text-muted-foreground",
              )}
            >
              {isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <span className="size-2 rounded-full bg-emerald-500" />
              )}
              {isPending ? "Thinking" : "Ready"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-[calc(100vh-18rem)] flex-col px-0">
          <Conversation className="min-h-[22rem]">
            <ConversationContent className="gap-5 px-4 py-6 sm:px-6">
              {messages.length > 0 ? (
                messages.map((message: UIMessage) => {
                  const text = getMessageText(message);

                  if (!text) {
                    return null;
                  }

                  return (
                    <Message key={message.id} from={message.role}>
                      <MessageContent
                        className={cn(
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-xl rounded-tr-sm"
                            : "rounded-none",
                        )}
                      >
                        <MessageResponse>{text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })
              ) : (
                <ConversationEmptyState
                  className="min-h-[22rem] gap-6"
                  icon={
                    <div className="bg-muted/50 flex size-16 items-center justify-center rounded-2xl border">
                      <SparklesIcon className="text-primary size-7" />
                    </div>
                  }
                  title="Plan the next hike"
                  description="Ask for route ideas, gear checks, weather-aware packing, or recommendations based on your saved trips."
                >
                  <div className="flex min-h-[22rem] flex-col items-center justify-center gap-6 text-center">
                    <div className="bg-muted/50 flex size-16 items-center justify-center rounded-2xl border">
                      <SparklesIcon className="text-primary size-7" />
                    </div>
                    <div className="grid max-w-md gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Plan the next hike
                      </h2>
                      <p className="text-muted-foreground text-sm leading-6">
                        Ask for route ideas, gear checks, weather-aware packing,
                        or recommendations based on your saved trips.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {promptSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </ConversationEmptyState>
              )}

              {isPending && messages.length > 0 && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 py-1">
                      <span className="bg-muted-foreground/60 size-2 animate-pulse rounded-full" />
                      <span className="bg-muted-foreground/60 size-2 animate-pulse rounded-full [animation-delay:150ms]" />
                      <span className="bg-muted-foreground/60 size-2 animate-pulse rounded-full [animation-delay:300ms]" />
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="bg-card/95 border-t px-4 py-4 sm:px-6">
            <PromptInput
              onSubmit={(message) => submitMessage(message.text)}
              className="rounded-xl"
            >
              <PromptInputBody>
                <PromptInputTextarea
                  className="min-h-12"
                  placeholder="Ask about routes, packing, or recommendations"
                  value={input}
                  onChange={(event) => setInput(event.currentTarget.value)}
                  disabled={isPending}
                />
              </PromptInputBody>
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={status}
                  disabled={!input.trim() || isPending}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
