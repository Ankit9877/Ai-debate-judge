import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

interface DebateMessage {
  id: string;
  side: "A" | "B";
  speaker: string;
  content: string;
  timestamp: string;
}

const sampleDebate: DebateMessage[] = [
  {
    id: "1",
    side: "A",
    speaker: "Alex",
    content: "Artificial intelligence will fundamentally transform education by providing personalized learning experiences at scale. Studies show that adaptive learning systems can improve student performance by up to 30%.",
    timestamp: "2 min ago"
  },
  {
    id: "2",
    side: "B",
    speaker: "Jordan",
    content: "While AI has benefits, it cannot replace the human element in education. Teachers provide emotional support, mentorship, and nuanced understanding that AI lacks. Education is about more than just knowledge transfer.",
    timestamp: "1 min ago"
  },
  {
    id: "3",
    side: "A",
    speaker: "Alex",
    content: "I'm not suggesting AI replaces teachers entirely. Rather, it augments their capabilities, allowing them to focus on the human aspects while AI handles personalization and administrative tasks. This combination maximizes both efficiency and empathy.",
    timestamp: "30 sec ago"
  },
];

const DebateInterface = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Live Debate</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Topic: "Will AI Transform Education More Than the Internet Did?"
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Round 2 of 5
              </Badge>
              <Badge className="bg-muted text-muted-foreground">
                Time Remaining: 3:45
              </Badge>
            </div>
          </div>

          {/* Debate Area */}
          <Card className="bg-card/50 backdrop-blur-md border-primary/20">
            <div className="p-6 space-y-6">
              {/* Team Headers */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Side A - Pro AI</h3>
                    <p className="text-sm text-muted-foreground">Alex Thompson</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Side B - Traditional</h3>
                    <p className="text-sm text-muted-foreground">Jordan Lee</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {sampleDebate.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.side === "A" ? "justify-start" : "justify-end"
                    } animate-slide-up`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.side === "A"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary/10 border border-secondary/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 opacity-70" />
                        <span className="font-semibold text-sm">{message.speaker}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="pt-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your argument..."
                    className="flex-1 px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <Button variant="default" className="px-6">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DebateInterface;
