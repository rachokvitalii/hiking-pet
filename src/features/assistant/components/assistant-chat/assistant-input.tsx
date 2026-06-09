import type { ChatStatus } from "ai";
import { AlertCircleIcon } from "lucide-react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";

type AssistantInputProps = {
  input: string;
  status: ChatStatus;
  isPending: boolean;
  errorMessage: string | null;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
};

export function AssistantInput({
  input,
  status,
  isPending,
  errorMessage,
  onInputChange,
  onSubmit,
}: AssistantInputProps) {
  return (
    <div className="bg-card/95 border-t px-4 py-4 sm:px-6">
      <PromptInput
        onSubmit={(message) => onSubmit(message.text)}
        className="rounded-xl"
      >
        <PromptInputBody>
          <PromptInputTextarea
            className="min-h-12"
            placeholder="Ask about routes, packing, or recommendations"
            value={input}
            onChange={(event) => onInputChange(event.currentTarget.value)}
            disabled={isPending}
          />
        </PromptInputBody>
        {errorMessage && (
          <div
            role="alert"
            className="text-destructive flex items-start gap-2 px-3 pb-2 text-sm"
          >
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit
            status={status}
            disabled={!input.trim() || isPending}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
