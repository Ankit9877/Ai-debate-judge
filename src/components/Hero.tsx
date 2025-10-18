import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, Scale, Shield } from "lucide-react";
import heroImage from "@/assets/hero-debate.png";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
        <img 
          src={heroImage} 
          alt="AI Debate Platform" 
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-md border border-primary/30">
            <Shield className="w-4 h-4 text-blockchain-accent" />
            <span className="text-sm text-muted-foreground">Powered by AI & Blockchain</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered Debate
            </span>
            <br />
            <span className="text-foreground">Judge Platform</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Participate in structured debates evaluated by advanced AI. 
            Every decision is transparent, immutable, and recorded on blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="glow-effect" onClick={() => navigate('/auth')}>
              Start Debating
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/debates')}>
              View Debates
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300 animate-slide-up">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Judge</h3>
              <p className="text-muted-foreground text-sm">
                Advanced AI evaluates arguments with detailed reasoning and scoring
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Verified</h3>
              <p className="text-muted-foreground text-sm">
                Results published on-chain for complete transparency and immutability
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fair & Unbiased</h3>
              <p className="text-muted-foreground text-sm">
                Eliminates human bias with automated, criteria-based evaluation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
