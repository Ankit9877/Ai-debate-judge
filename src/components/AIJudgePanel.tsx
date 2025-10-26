import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Award, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { mockResults } from "@/data/mockResults";
import { reasoningPool } from "@/data/mockResults";

interface DebateRow {
  completed_at: string | null;
  created_at: string;
  created_by: string | null;
  description: string | null;
  id: string;
  max_arguments: number | null;
  mode: string;
  side_a_name: string;
  side_b_name: string;
  started_at: string | null;
  status: string;
  topic: string;
}

interface AIJudgePanelProps {
  debate?: DebateRow;
  result?: typeof mockResults[0];
}

const AIJudgePanel = ({ debate, result: propResult }: AIJudgePanelProps) => {
  const [result, setResult] = useState(propResult || mockResults[0]);

  useEffect(() => {
    if (propResult) {
      setResult(propResult);
    } else if (debate) {
      // Random scores
      const sideAScore = Math.random() * 3 + 7; // 7-10
      const sideBScore = Math.random() * 3 + 6; // 6-9

      const sideAData = {
        name: debate.side_a_name,
        score: sideAScore,
        logic: Math.floor(Math.random() * 4 + 7),
        evidence: Math.floor(Math.random() * 4 + 7),
        persuasion: Math.floor(Math.random() * 4 + 7),
      };

      const sideBData = {
        name: debate.side_b_name,
        score: sideBScore,
        logic: Math.floor(Math.random() * 4 + 6),
        evidence: Math.floor(Math.random() * 4 + 6),
        persuasion: Math.floor(Math.random() * 4 + 6),
      };

      // Determine winner
      const winner = sideAScore > sideBScore ? "A" : "B";

      // Pick reasoning based on winner
      let reasoningIndex: number;
      if (winner === "A") {
        // 0-4: Side A pro only, 5-9: Side A pro & Side B con
        reasoningIndex = Math.floor(Math.random() * 10);
      } else {
        // 10-14: Side B pro only, 15-19: Side B pro & Side B con
        reasoningIndex = Math.floor(Math.random() * 10) + 10;
      }

      const randomReasoning = reasoningPool[reasoningIndex];

      setResult({
        id: debate.id,
        sideA: sideAData,
        sideB: sideBData,
        reasoning: randomReasoning,
        highlights: {
          strongest: "Sample strongest point",
          bestRebuttal: "Sample best rebuttal",
          insight: "Sample critical insight",
        },
        blockchainHash: "0x0000...mock",
      });
    } else {
      // Pick random mock result
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(randomResult);
    }
  }, [debate, propResult]);


  const { sideA, sideB, reasoning, highlights, blockchainHash } = result;

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background to-card/20">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ai-accent/20 border border-ai-accent/30">
              <Brain className="w-4 h-4 text-ai-accent" />
              <span className="text-sm font-medium text-ai-accent">AI Analysis Complete</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Judge's Verdict
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive evaluation based on logic, evidence, and persuasiveness
            </p>
          </div>

          {/* Scores Card */}
          <Card className="bg-card/80 backdrop-blur-md border-primary/30 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <SideScore side={sideA} isWinner={sideA.score > sideB.score} primary />
                <SideScore side={sideB} isWinner={sideB.score > sideA.score} primary={false} />
              </div>

              {/* AI Reasoning */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2 text-ai-accent">
                  <FileText className="w-5 h-5" />
                  <h4 className="font-semibold text-lg">AI Judge Reasoning</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">{reasoning}</p>

                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  <Highlight icon={<TrendingUp />} title="Strongest Point" text={highlights.strongest} />
                  <Highlight icon={<Award />} title="Best Rebuttal" text={highlights.bestRebuttal} />
                  <Highlight icon={<Brain />} title="Critical Insight" text={highlights.insight} />
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain */}
          <Card className="bg-gradient-to-r from-blockchain-accent/10 to-primary/10 border border-blockchain-accent/30 backdrop-blur-md">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blockchain-accent/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blockchain-accent" />
                </div>
                <div>
                  <h4 className="font-semibold">Blockchain Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Result recorded on-chain: <span className="font-mono text-blockchain-accent">{blockchainHash}</span>
                  </p>
                </div>
              </div>
              <Badge className="bg-blockchain-accent/20 text-blockchain-accent border-blockchain-accent/30">
                Immutable
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

const SideScore = ({
  side,
  isWinner,
  primary,
}: {
  side: typeof mockResults[0]["sideA"];
  isWinner: boolean;
  primary: boolean;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{side.name}</h3>
      {isWinner && (
        <Badge className={`${primary ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary/20 text-secondary border-secondary/30"}`}>
          Winner
        </Badge>
      )}
    </div>
    <div className="relative">
      <div className="flex items-end gap-2">
        <span className={`text-6xl font-bold ${primary ? "bg-gradient-primary bg-clip-text text-transparent" : "text-foreground"}`}>
          {side.score.toFixed(1)}
        </span>
        <span className="text-2xl text-muted-foreground mb-2">/10</span>
      </div>
      {["logic", "evidence", "persuasion"].map((k) => (
        <div key={k} className="mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground capitalize">{k}</span>
            <span className="font-semibold">{side[k as keyof typeof side]}/10</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`${primary ? "bg-gradient-primary" : "bg-secondary"} h-2 rounded-full`}
              style={{ width: `${(side[k as keyof typeof side] as number) * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Highlight = ({ icon, title, text }: { icon: JSX.Element; title: string; text: string }) => (
  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
    <div className="text-primary mt-0.5">{icon}</div>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{text}</p>
    </div>
  </div>
);

export default AIJudgePanel;
