import type { UIMessage } from "ai";
import { SparklesIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
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
import { PROMPT_SUGGESTIONS } from "~/features/assistant/constants";
import { getMessageText } from "~/features/assistant/utils";
import { cn } from "~/lib/utils";

type AssistantMessagesProps = {
  messages: UIMessage[];
  isPending: boolean;
  onSuggestionSelect: (suggestion: string) => void;
};

export function AssistantMessages({
  messages,
  isPending,
  onSuggestionSelect,
}: AssistantMessagesProps) {
  return (
    <Conversation className="min-h-[22rem]">
      <ConversationContent className="gap-5 px-4 py-6 sm:px-6">
        {messages.length > 0 ? (
          messages.map((message) => {
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
          <ConversationEmptyState className="min-h-[22rem] gap-6">
            <div className="bg-muted/50 flex size-16 items-center justify-center rounded-2xl border">
              <SparklesIcon className="text-primary size-7" />
            </div>
            <div className="grid max-w-md gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Plan the next hike
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                Ask for route ideas, gear checks, weather-aware packing, or
                recommendations based on your saved trips.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
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
  );
}
