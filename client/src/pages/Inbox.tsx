import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

const mockThreads = [
  {
    id: "1",
    bookingId: "b1",
    otherUser: { id: "u1", name: "John Smith", avatar: null },
    lastMessage: "Thanks! See you tomorrow at 2 PM.",
    timestamp: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    bookingId: "b2",
    otherUser: { id: "u2", name: "Sarah Johnson", avatar: null },
    lastMessage: "Can we reschedule to next week?",
    timestamp: "Yesterday",
    unread: 0,
  },
];

const mockMessages = [
  {
    id: "m1",
    senderId: "u1",
    content: "Hi! I'm interested in booking your service.",
    timestamp: "10:15 AM",
  },
  {
    id: "m2",
    senderId: "me",
    content: "Great! What day works best for you?",
    timestamp: "10:20 AM",
  },
  {
    id: "m3",
    senderId: "u1",
    content: "How about tomorrow at 2 PM?",
    timestamp: "10:25 AM",
  },
  {
    id: "m4",
    senderId: "me",
    content: "Perfect! I'll see you then.",
    timestamp: "10:28 AM",
  },
  {
    id: "m5",
    senderId: "u1",
    content: "Thanks! See you tomorrow at 2 PM.",
    timestamp: "10:30 AM",
  },
];

export default function Inbox() {
  const [selectedThread, setSelectedThread] = useState(mockThreads[0]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement message sending
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
        {/* Threads List */}
        <div className="w-full md:w-80 border-r">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg" data-testid="text-inbox-title">
              Messages
            </h2>
          </div>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            {mockThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 border-b cursor-pointer hover-elevate transition-colors ${
                  selectedThread.id === thread.id ? "bg-muted" : ""
                }`}
                data-testid={`thread-${thread.id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={thread.otherUser.avatar || undefined} />
                    <AvatarFallback>
                      {thread.otherUser.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold truncate">
                        {thread.otherUser.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {thread.timestamp}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {thread.lastMessage}
                    </div>
                  </div>
                  {thread.unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {thread.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedThread.otherUser.avatar || undefined} />
              <AvatarFallback>
                {selectedThread.otherUser.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{selectedThread.otherUser.name}</div>
              <div className="text-sm text-muted-foreground">
                Booking: Fix Kitchen Faucet
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderId === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.senderId === "me"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                data-testid="input-message"
              />
              <Button onClick={handleSendMessage} data-testid="button-send-message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
