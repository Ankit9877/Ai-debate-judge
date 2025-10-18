import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { getRandomTopic } from "@/utils/debateTopics";
import { Loader2 } from "lucide-react";

const Debates = () => {
  const [user, setUser] = useState<User | null>(null);
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [sideAName, setSideAName] = useState("");
  const [sideBName, setSideBName] = useState("");
  const [mode, setMode] = useState<"online" | "offline">("online");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDebates();
    }
  }, [user]);

  const fetchDebates = async () => {
    if (!user) return;
    
    try {
      // Get debates where user is a participant
      const { data: participantDebates, error: participantError } = await supabase
        .from('debate_participants')
        .select('debate_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      const participantDebateIds = participantDebates?.map(p => p.debate_id) || [];

      // Get debates created by user or user is participating in
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .or(`created_by.eq.${user.id},id.in.(${participantDebateIds.length > 0 ? participantDebateIds.join(',') : 'null'})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDebate = async () => {
    if (!user) return;

    try {
      if (mode === "online") {
        // For online mode, find or create matchmaking
        await findMatch();
      } else {
        // For offline mode, use custom topic and names
        const { data, error } = await supabase
          .from('debates')
          .insert({
            topic,
            description,
            side_a_name: sideAName || 'Side A',
            side_b_name: sideBName || 'Side B',
            created_by: user.id,
            mode,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Debate created successfully!",
        });

        setOpen(false);
        setTopic("");
        setDescription("");
        setSideAName("");
        setSideBName("");
        setMode("online");
        fetchDebates();
        
        navigate(`/debate/${data.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const findMatch = async () => {
    if (!user) return;

    try {
      // Look for waiting debates
      const { data: waitingDebates, error: fetchError } = await supabase
        .from('debates')
        .select('*')
        .eq('mode', 'online')
        .eq('status', 'waiting')
        .is('started_at', null)
        .limit(1);

      if (fetchError) throw fetchError;

      if (waitingDebates && waitingDebates.length > 0) {
        // Join existing debate
        const debate = waitingDebates[0];
        
      // Add user as participant on Side B
      const { error: participantError } = await supabase
        .from('debate_participants')
        .insert({
          debate_id: debate.id,
          user_id: user.id,
          side: 'b',
        });

        if (participantError) throw participantError;

        // Update debate status to active
        const { error: updateError } = await supabase
          .from('debates')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', debate.id);

        if (updateError) throw updateError;

        toast({
          title: "Match Found!",
          description: "You've been matched with an opponent!",
        });

        setOpen(false);
        navigate(`/debate/${debate.id}`);
      } else {
        // Create new debate and wait for opponent
        const randomTopic = getRandomTopic();
        
        const { data: newDebate, error: createError } = await supabase
          .from('debates')
          .insert({
            topic: randomTopic,
            description: 'Online matchmaking debate',
            side_a_name: 'Side A',
            side_b_name: 'Side B',
            created_by: user.id,
            mode: 'online',
            status: 'waiting',
          })
          .select()
          .single();

        if (createError) throw createError;

      // Add creator as Side A participant
      const { error: participantError } = await supabase
        .from('debate_participants')
        .insert({
          debate_id: newDebate.id,
          user_id: user.id,
          side: 'a',
        });

        if (participantError) throw participantError;

        toast({
          title: "Finding Match...",
          description: "Waiting for an opponent to join",
        });

        setOpen(false);
        navigate(`/debate/${newDebate.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500/20 text-yellow-500';
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Debates</h1>
          <div className="flex gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="glow-effect">Create Debate</Button>
              </DialogTrigger>
              <DialogContent className="glass-panel">
                <DialogHeader>
                  <DialogTitle>Create New Debate</DialogTitle>
                  <DialogDescription>
                    Set up a new debate topic for others to join
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Debate Mode</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={mode === "online" ? "default" : "outline"}
                        onClick={() => setMode("online")}
                        className="w-full"
                      >
                        🌐 Online Debate
                      </Button>
                      <Button
                        type="button"
                        variant={mode === "offline" ? "default" : "outline"}
                        onClick={() => setMode("offline")}
                        className="w-full"
                      >
                        🤖 Offline Debate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {mode === "online" 
                        ? "Get matched with another user for a real-time debate" 
                        : "Practice debating against AI opponents"}
                    </p>
                  </div>

                  {mode === "online" ? (
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Online Matchmaking</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        You'll be matched with another user and given a random debate topic. 
                        Click "Find Match" to start!
                      </p>
                      <Button onClick={createDebate} className="w-full">
                        <Loader2 className="mr-2 h-4 w-4" />
                        Find Match
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium">Topic</label>
                        <Input
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., AI will replace human jobs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide context for this debate..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Side A Name</label>
                          <Input
                            value={sideAName}
                            onChange={(e) => setSideAName(e.target.value)}
                            placeholder="Pro AI"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Side B Name</label>
                          <Input
                            value={sideBName}
                            onChange={(e) => setSideBName(e.target.value)}
                            placeholder="Traditional"
                          />
                        </div>
                      </div>
                      <Button onClick={createDebate} className="w-full">
                        Create Debate
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {debates.map((debate) => (
            <Card 
              key={debate.id} 
              className="glass-panel hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate(`/debate/${debate.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{debate.topic}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {debate.mode === 'online' ? '🌐 Online' : '🤖 Offline'}
                    </Badge>
                    <Badge className={getStatusColor(debate.status)}>
                      {debate.status}
                    </Badge>
                  </div>
                </div>
                {debate.description && (
                  <CardDescription className="line-clamp-2">
                    {debate.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{debate.side_a_name}</span>
                  <span>vs</span>
                  <span>{debate.side_b_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {debates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No debates yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Debates;