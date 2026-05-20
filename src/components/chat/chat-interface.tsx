"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { SendHorizonal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ask Drift AI anything about your clients or portfolio.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              {message.role === "assistant" && message.toolInvocations && message.toolInvocations.length > 0 && (
                <Accordion type="single" collapsible className="w-full max-w-lg">
                  <AccordionItem value="reasoning">
                    <AccordionTrigger className="text-xs text-muted-foreground">
                      Working...
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(message.toolInvocations, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              <div
                className={cn(
                  "max-w-lg rounded-lg px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start">
              <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about a client, portfolio, or task..."
          disabled={isLoading}
          className="flex-1"
        />
        {isLoading ? (
          <Button type="button" variant="outline" size="icon" onClick={stop} title="Cancel">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
