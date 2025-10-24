// Imports and Setup (UNCHANGED)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { debateId } = await req.json();
    if (!debateId) throw new Error('Debate ID is required');

    // Supabase keys setup (UNCHANGED)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!; 
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ... (Authorization checks and data fetching logic - UNCHANGED) ...

    const { data: debate, error: debateError } = await supabase
      .from('debates')
      .select('*')
      .eq('id', debateId)
      .single();
    if (debateError) throw debateError;

    const { data: debateArgs, error: argsError } = await supabase
      .from('debate_arguments')
      .select('*')
      .eq('debate_id', debateId)
      .order('created_at', { ascending: true });
    if (argsError) throw argsError;

    const sideAArgs = debateArgs?.filter(arg => arg.side === 'a') || [];
    const sideBArgs = debateArgs?.filter(arg => arg.side === 'b') || [];

    // Prepare prompt: Combine ALL arguments into a single text block
    const prompt = `DEBATE TOPIC: ${debate.topic}\n\nSIDE A (${debate.side_a_name}):\n${sideAArgs.map((arg, i) => `${i + 1}. ${arg.content}`).join('\n')}\n\nSIDE B (${debate.side_b_name}):\n${sideBArgs.map((arg, i) => `${i + 1}. ${arg.content}`).join('\n')}`;

    // ----------------------------------------------------------------------
    // --- START: YOUR CUSTOM AI EVALUATION LOGIC 🎯 ---
    
    // ⚠️ FINAL URL INSERTED HERE!
    const CUSTOM_AI_ENDPOINT = "https://evaluating-debate-2.onrender.com"; 
    
    // Pass the full debate text as a single argument to your model
    const customRequestBody = JSON.stringify({
        argument_text: prompt,
    });

    const customResponse = await fetch(CUSTOM_AI_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: customRequestBody,
    });

    if (!customResponse.ok) {
        const errorText = await customResponse.text();
        console.error('Custom AI API error:', customResponse.status, customResponse.statusText, errorText);
        throw new Error('Failed to evaluate debate with custom AI: ' + errorText);
    }

    const scores = await customResponse.json();
    
    if (typeof scores.overall_score !== 'number') {
         throw new Error("Custom AI response is missing the expected 'overall_score'.");
    }
    
    // MAPPING LOGIC: Scale 1-5 score to 0-100: (Score - 1) / 4 * 100
    // We use the overall quality score of the full prompt as a PROXY for Side A's strength
    
    const overall_quality_0_100 = ((scores.overall_score - 1) / 4) * 100;
    const sideA_logic = ((scores.logical_score - 1) / 4) * 100;
    const sideA_persuasion = ((scores.rhetorical_score - 1) / 4) * 100;

    let evaluation = {
        // Overall Scores (Total)
        side_a_score: Math.max(0, Math.min(100, overall_quality_0_100)),
        side_b_score: Math.max(0, Math.min(100, 100 - overall_quality_0_100)),
        
        // Component Scores 
        side_a_logic_score: Math.max(0, Math.min(100, sideA_logic)),
        side_a_evidence_score: Math.max(0, Math.min(100, sideA_logic)), // Using Logic as proxy for Evidence
        side_a_persuasion_score: Math.max(0, Math.min(100, sideA_persuasion)),
        
        side_b_logic_score: Math.max(0, Math.min(100, 100 - sideA_logic)),
        side_b_evidence_score: Math.max(0, Math.min(100, 100 - sideA_logic)),
        side_b_persuasion_score: Math.max(0, Math.min(100, 100 - sideA_persuasion)),
        
        winner: overall_quality_0_100 > 50.1 ? 'a' : (overall_quality_0_100 < 49.9 ? 'b' : 'tie'),
        
        reasoning: `Verdict based on a fine-tuned Webis-ArgQuality model (DistilBERT) using a single-argument proxy. The overall quality score was ${scores.overall_score.toFixed(2)} (out of 5.0).`,
    };
    
    // --- END: YOUR CUSTOM AI EVALUATION LOGIC 🚀 ---
    // ----------------------------------------------------------------------
    
    // Create a verifiable hash of the debate result (UNCHANGED)
    const resultData = { /* ... */ };
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(resultData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const resultHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const blockchainTxHash = `0x${resultHash}`;

    // Store results in database (UNCHANGED)
    const { data: result, error: resultError } = await supabase
      .from('debate_results')
      .insert({
        debate_id: debateId,
        side_a_score: evaluation.side_a_score,
        side_b_score: evaluation.side_b_score,
        side_a_logic_score: evaluation.side_a_logic_score,
        side_a_evidence_score: evaluation.side_a_evidence_score,
        side_a_persuasion_score: evaluation.side_a_persuasion_score,
        side_b_logic_score: evaluation.side_b_logic_score,
        side_b_evidence_score: evaluation.side_b_evidence_score,
        side_b_persuasion_score: evaluation.side_b_persuasion_score,
        winner: evaluation.winner,
        reasoning: evaluation.reasoning,
        blockchain_tx_hash: blockchainTxHash,
        blockchain_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (resultError) throw resultError;

    // Update debate status (UNCHANGED)
    await supabase
      .from('debates')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', debateId);
    
    return new Response(JSON.stringify({ success: true, result: evaluation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error evaluating debate:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});