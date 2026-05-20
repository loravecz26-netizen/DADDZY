import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">Ask Drift AI about your clients and book.</p>
      </div>
      <div className="flex-1 overflow-hidden rounded-lg border">
        <ChatInterface />
      </div>
    </div>
  );
}
