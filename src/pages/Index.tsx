import Hero from "@/components/Hero";
import DebateInterface from "@/components/DebateInterface";
import AIJudgePanel from "@/components/AIJudgePanel";
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <DebateInterface />
      <AIJudgePanel />
    </div>
  );
};

export default Index;
