import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Award, FileText } from "lucide-react";

const AIJudgePanel = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background to-card/20">
      {/* Background decoration */}
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
              {/* Score Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Side A Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Side A - Pro AI</h3>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Winner
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        8.5
                      </span>
                      <span className="text-2xl text-muted-foreground mb-2">/10</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Logic</span>
                        <span className="font-semibold">9/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '90%' }} />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Evidence</span>
                        <span className="font-semibold">8/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '80%' }} />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Persuasiveness</span>
                        <span className="font-semibold">8.5/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side B Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Side B - Traditional</h3>
                  </div>
                  <div className="relative">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-bold text-foreground">
                        7.2
                      </span>
                      <span className="text-2xl text-muted-foreground mb-2">/10</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Logic</span>
                        <span className="font-semibold">7/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Evidence</span>
                        <span className="font-semibold">6.5/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Persuasiveness</span>
                        <span className="font-semibold">8/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2 text-ai-accent">
                  <FileText className="w-5 h-5" />
                  <h4 className="font-semibold text-lg">AI Judge Reasoning</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Side A presented a more comprehensive argument supported by statistical evidence and a balanced perspective. 
                  Their acknowledgment of AI's limitations while emphasizing its augmentative role demonstrated strategic reasoning. 
                  Side B effectively highlighted the irreplaceable human elements in education but relied more on emotional appeals 
                  than concrete counterarguments to Side A's data-driven points.
                </p>
                
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Strongest Point</p>
                      <p className="text-xs text-muted-foreground mt-1">Side A's data on adaptive learning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Award className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Best Rebuttal</p>
                      <p className="text-xs text-muted-foreground mt-1">Side B's human connection argument</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Brain className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Critical Insight</p>
                      <p className="text-xs text-muted-foreground mt-1">Augmentation vs replacement framing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain Verification */}
          <Card className="bg-gradient-to-r from-blockchain-accent/10 to-primary/10 border border-blockchain-accent/30 backdrop-blur-md">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blockchain-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blockchain-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.64v8.43c0 4.45-3.08 8.63-7 9.67V4.18z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Blockchain Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Result recorded on-chain: <span className="font-mono text-blockchain-accent">0x7a3b...9f2c</span>
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

export default AIJudgePanel;
