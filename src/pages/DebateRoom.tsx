import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, replace } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as Toast } from 'react-toastify'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Users, Clock } from "lucide-react";

const DebateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [debate, setDebate] = useState<any>(null);
  const [debateArguments, setDebateArguments] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [userSide, setUserSide] = useState<'a' | 'b' | null>(null);
  const [argument, setArgument] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds per argument
  const [totalTimeLeft, setTotalTimeLeft] = useState(1200); // 20 minutes total
  const [currentTurn, setCurrentTurn] = useState<'a' | 'b'>('a');
  const [timerActive, setTimerActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const fetchDebateData = useCallback(async () => {
    if (!id) return;

    const { data: debateData } = await supabase
      .from('debates')
      .select('*')
      .eq('id', id)
      .single();

    const { data: argsData } = await supabase
      .from('debate_arguments')
      .select('*, profiles(username, display_name)')
      .eq('debate_id', id)
      .order('created_at', { ascending: true });

    const { data: partsData } = await supabase
      .from('debate_participants')
      .select('*, profiles(username)')
      .eq('debate_id', id);

    const { data: resultData } = await supabase
      .from('debate_results')
      .select('*')
      .eq('debate_id', id)
      .single();

    setDebate(debateData);
    setDebateArguments(argsData || []);
    setParticipants(partsData || []);
    setResult(resultData);

    const userParticipant = partsData?.find(p => p.user_id === user?.id);
    if (userParticipant) {
      setUserSide(userParticipant.side as 'a' | 'b');
    }
  }, [id, user]);

  useEffect(() => {
    if (id && user) {
      fetchDebateData();
      subscribeToChanges();
    }
  }, [id, user, fetchDebateData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [debateArguments]);

  // Timer effect for offline debates
  useEffect(() => {
    if (!timerActive || debate?.mode === 'online') return;

    const timer = setInterval(() => {
      // Countdown total debate time
      setTotalTimeLeft((prev) => Math.max(0, prev - 1));

      // Countdown per-argument time
      setTimeLeft((prev) => {
        if (prev <= 1) {
          switchTurn();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, debate?.mode]);
  // page reload logic
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!debate) return
      if (!timerActive) return
      e.preventDefault();
      e.returnValue = "Do you want to reload page??";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [debate]);

  const switchTurn = () => {
    setCurrentTurn(prev => prev === 'a' ? 'b' : 'a');
    setTimeLeft(120);
  };

  const startTimer = () => {
    setTimerActive(true);
    setTimeLeft(120);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('debate-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_arguments', filter: `debate_id=eq.${id}` }, () => {
        fetchDebateData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_results', filter: `debate_id=eq.${id}` }, () => {
        fetchDebateData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debates', filter: `id=eq.${id}` }, () => {
        fetchDebateData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_participants', filter: `debate_id=eq.${id}` }, () => {
        fetchDebateData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startOfflineDebate = async () => {
    if (!user) return;

    try {
      // Check which sides the user has already joined
      const { data: existingParticipants } = await supabase
        .from('debate_participants')
        .select('side')
        .eq('debate_id', id)
        .eq('user_id', user.id);

      const existingSides = new Set(existingParticipants?.map(p => p.side) || []);
      const sidesToInsert = [];

      if (!existingSides.has('a')) {
        sidesToInsert.push({ debate_id: id, user_id: user.id, side: 'a' });
      }
      if (!existingSides.has('b')) {
        sidesToInsert.push({ debate_id: id, user_id: user.id, side: 'b' });
      }

      // Insert only missing sides
      if (sidesToInsert.length > 0) {
        const { error } = await supabase
          .from('debate_participants')
          .insert(sidesToInsert);

        if (error) throw error;
      }

      // Start debate
      await supabase
        .from('debates')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', id);

      toast({
        title: "Success",
        description: "Debate started! You control both sides.",
      });

      setUserSide('a'); // Set to 'a' just to mark as joined
      fetchDebateData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinSide = async (side: 'a' | 'b') => {
    if (!user || userSide) return;

    try {
      // For online debates, join only the selected side
      const { error } = await supabase
        .from('debate_participants')
        .insert({
          debate_id: id,
          user_id: user.id,
          side,
        });

      if (error) throw error;

      // Start debate if not started
      if (debate?.status === 'waiting') {
        await supabase
          .from('debates')
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq('id', id);
      }

      toast({
        title: "Success",
        description: `Joined ${side === 'a' ? debate.side_a_name : debate.side_b_name}`,
      });

      setUserSide(side);
      fetchDebateData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const submitArgument = async () => {
    if (!user || !argument.trim()) return;

    // For offline debates, determine which side is submitting based on current turn
    const submittingSide = debate?.mode === 'online' ? userSide : currentTurn;

    if (!submittingSide) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('debate_arguments')
        .insert({
          debate_id: id,
          user_id: user.id,
          side: submittingSide,
          content: argument,
          argument_order: debateArguments.filter(a => a.side === submittingSide).length + 1,
        });

      if (error) throw error;

      setArgument("");

      // FIX 1: Force re-fetch immediately to ensure argument list updates right away
      await fetchDebateData();

      // Switch turn and reset timer for offline debates
      if (debate?.mode !== 'online') {
        switchTurn();
        // FIX 2: Start timer if it's not already active
        if (!timerActive) {
          startTimer();
        }
      }

      toast({
        title: "Success",
        description: "Argument submitted!",
      });
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

  const evaluateDebate = async () => {
    if (!user || debate?.status === 'completed') return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('evaluate-debate', {
        body: { debateId: id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Debate evaluated by AI Judge!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      EndDebate();
    }
  };

  if (!debate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const sideAParticipant = participants.find(p => p.side === 'a');
  const sideBParticipant = participants.find(p => p.side === 'b');
  const isOnlineDebate = debate.mode === 'online';

  const handleExit = () => {
    if (timerActive) {
      Toast.warning("Can't exit while debate is running!!!", { position: "top-left" });
      return
    }
    navigate('/debates');
  }

  const EndDebate = async () => {
    if (!id || !user) return;

    try {
      const { error } = await supabase
        .from("debates")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Debate Ended",
        description: "The debate has been marked as inactive.",
      });

      // Refresh debate data to reflect change
      await fetchDebateData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTimerActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => handleExit()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Debates
        </Button>

        <Card className="glass-panel mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold gradient-text">{debate.topic}</h1>
                  {isOnlineDebate && (
                    <Badge variant="outline" className="text-xs">
                      🌐 Online Match
                    </Badge>
                  )}
                </div>
                {debate.description && debate.mode !== 'online' && (
                  <p className="text-muted-foreground">{debate.description}</p>
                )}
              </div>
              <Badge className={
                debate.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-500' :
                  debate.status === 'active' ? 'bg-green-500/20 text-green-500' :
                    'bg-blue-500/20 text-blue-500'
              }>
                {debate.status}
              </Badge>
            </div>

            {/* Waiting for opponent message */}
            {isOnlineDebate && debate.status === 'waiting' && (
              <div className="bg-secondary/20 p-6 rounded-lg text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Waiting for opponent...</h3>
                <p className="text-sm text-muted-foreground">
                  Finding another user to join this debate
                </p>
              </div>
            )}

            {/* Show participants for online debates */}
            {isOnlineDebate && debate.status !== 'waiting' && (
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Side A</div>
                    <div className="font-medium">
                      {sideAParticipant?.profiles?.username || 'Waiting...'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Side B</div>
                    <div className="font-medium">
                      {sideBParticipant?.profiles?.username || 'Waiting...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Start debate button for offline debates only */}
            {!isOnlineDebate && !userSide && debate.status !== 'completed' && (
              <Button onClick={startOfflineDebate} className="w-full" size="lg">
                Start Debate
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Chat-style debate view for offline debates */}
        {!isOnlineDebate && (
          <>
            {/* Timer */}
            {debate.status === 'active' && !result && (
              <Card className="glass-panel mb-6">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Total Debate Time */}
                    <div className="flex items-center justify-center gap-4">
                      <Clock className="h-6 w-6 text-primary" />
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">
                          Total Debate Time
                        </div>
                        <div className="text-3xl font-bold gradient-text">
                          {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          20 minutes total
                        </div>
                      </div>
                    </div>

                    {/* Per Argument Time */}
                    <div className="flex items-center justify-center gap-4">
                      <Clock className="h-6 w-6 text-secondary" />
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">
                          Current Turn: {currentTurn === 'a' ? debate.side_a_name : debate.side_b_name}
                        </div>
                        <div className="text-3xl font-bold gradient-text">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {timerActive ? '2 min per argument' : 'Timer paused'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* FIX: Simplified button visibility - show if timer is not active */}
                  {timerActive ?
                    <Button onClick={() => EndDebate()} variant="destructive" className="w-full mt-4">
                      End Debate
                    </Button>
                    : <Button onClick={startTimer} className="w-full mt-4">
                      Start Debate Timer
                    </Button>
                  }
                </CardContent>
              </Card>
            )}

            {/* WhatsApp-Style Chat Display */}
            <Card className="glass-panel mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Debate Arguments</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
                  {debateArguments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      No arguments yet. Start the debate!
                    </div>
                  ) : (
                    debateArguments.map((arg, idx) => {
                      const isLeftSide = arg.side === 'a';
                      return (
                        <div
                          key={arg.id}
                          className={`flex ${isLeftSide ? 'justify-start' : 'justify-end'} animate-slide-up`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isLeftSide
                              ? 'bg-card border border-primary/20 rounded-tl-none'
                              : 'bg-primary/20 border border-primary/30 rounded-tr-none'
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${isLeftSide ? 'text-primary' : 'text-primary'}`}>
                                {isLeftSide ? debate.side_a_name : debate.side_b_name}
                              </span>
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                #{idx + 1}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed break-words">{arg.content}</p>
                            <div className="flex justify-end mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(arg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Input Areas - One for each side */}
            {debate.status === 'active' && !result && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Side A Input */}
                <Card className={`glass-panel ${(currentTurn === 'a' && timerActive) ? 'ring-2 ring-primary' : 'opacity-60'}`}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-primary">
                          {debate.side_a_name}
                        </h3>
                        {currentTurn === 'a' && (
                          <Badge className="bg-green-500/20 text-green-500">Active Turn</Badge>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={currentTurn === 'a' ? argument : ''}
                      onChange={(e) => currentTurn === 'a' && setArgument(e.target.value)}
                      placeholder={
                        currentTurn !== 'a'
                          ? "Wait for your turn..."
                          : "Present your argument..."
                      }
                      className="min-h-[120px] mb-3"
                      disabled={currentTurn !== 'a' || !timerActive}
                    />
                    <Button
                      onClick={submitArgument}
                      disabled={loading || !argument.trim() || currentTurn !== 'a'}
                      className="w-full"
                    >
                      {loading && currentTurn === 'a' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Argument
                    </Button>
                  </CardContent>
                </Card>

                {/* Side B Input */}
                <Card className={`glass-panel ${(currentTurn === 'b' && timerActive) ? 'ring-2 ring-secondary' : 'opacity-60'}`}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-secondary">
                          {debate.side_b_name}
                        </h3>
                        {currentTurn === 'b' && (
                          <Badge className="bg-green-500/20 text-green-500">Active Turn</Badge>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={currentTurn === 'b' ? argument : ''}
                      onChange={(e) => currentTurn === 'b' && setArgument(e.target.value)}
                      placeholder={
                        currentTurn !== 'b'
                          ? "Wait for your turn..."
                          : "Present your argument..."
                      }
                      className="min-h-[120px] mb-3"
                      disabled={currentTurn !== 'b' || !timerActive}
                    />
                    <Button
                      onClick={submitArgument}
                      disabled={loading || !argument.trim() || currentTurn !== 'b'}
                      className="w-full"
                    >
                      {loading && currentTurn === 'b' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Argument
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Original grid view for online debates */}
        {isOnlineDebate && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Side A Section */}
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-primary">
                    {sideAParticipant?.profiles?.username || debate.side_a_name}
                  </h2>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {debateArguments.filter(arg => arg.side === 'a').map((arg, idx) => (
                    <div key={arg.id} className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-xs text-muted-foreground mb-1">
                        Argument {idx + 1}
                      </div>
                      <p className="text-sm">{arg.content}</p>
                    </div>
                  ))}
                </div>

                {userSide === 'a' && debate.status === 'active' && !result && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <Textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      placeholder="Present your argument..."
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={submitArgument}
                      disabled={loading || !argument.trim()}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Argument
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Side B Section */}
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-secondary">
                    {sideBParticipant?.profiles?.username || debate.side_b_name}
                  </h2>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {debateArguments.filter(arg => arg.side === 'b').map((arg, idx) => (
                    <div key={arg.id} className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                      <div className="text-xs text-muted-foreground mb-1">
                        Argument {idx + 1}
                      </div>
                      <p className="text-sm">{arg.content}</p>
                    </div>
                  ))}
                </div>

                {userSide === 'b' && debate.status === 'active' && !result && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <Textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      placeholder="Present your argument..."
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={submitArgument}
                      disabled={loading || !argument.trim()}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Argument
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Evaluate Button */}
        {userSide && debate.status === 'active' && !result && debateArguments.length >= 4 && (
          <div className="flex justify-center mb-6">
            <Button onClick={evaluateDebate} disabled={loading} variant="secondary" size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Request AI Verdict
            </Button>
          </div>
        )}

        {result && (
          <Card className="glass-panel glow-effect">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">AI Judge Verdict</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">{debate.side_a_name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score</span>
                      <span className="font-bold text-primary">{result.side_a_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Logic</span>
                      <span>{result.side_a_logic_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Evidence</span>
                      <span>{result.side_a_evidence_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Persuasiveness</span>
                      <span>{result.side_a_persuasion_score}/100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">{debate.side_b_name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score</span>
                      <span className="font-bold text-secondary">{result.side_b_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Logic</span>
                      <span>{result.side_b_logic_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Evidence</span>
                      <span>{result.side_b_evidence_score}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Persuasiveness</span>
                      <span>{result.side_b_persuasion_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Winner</h3>
                <Badge className="text-lg px-4 py-2">
                  {result.winner === 'tie' ? 'Tie' : result.winner === 'a' ? debate.side_a_name : debate.side_b_name}
                </Badge>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">AI Reasoning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
              </div>

              <div className="p-4 bg-accent/20 rounded-lg border border-accent">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Blockchain Verified
                </h3>
                <p className="text-xs font-mono break-all text-muted-foreground">
                  Tx Hash: {result.blockchain_tx_hash}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verified at: {new Date(result.blockchain_verified_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default DebateRoom;
