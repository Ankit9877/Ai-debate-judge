import Hero from "@/components/Hero";
import DebateInterface from "@/components/DebateInterface";
import AIJudgePanel from "@/components/AIJudgePanel";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <DebateInterface />
      <AIJudgePanel />
    </div>
  );
};

export default Index;
