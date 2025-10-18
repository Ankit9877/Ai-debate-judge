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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch debate details
    const { data: debate, error: debateError } = await supabase
      .from('debates')
      .select('*')
      .eq('id', debateId)
      .single();
    if (debateError) throw debateError;

    // Fetch all arguments
    const { data: debateArgs, error: argsError } = await supabase
      .from('debate_arguments')
      .select('*')
      .eq('debate_id', debateId)
      .order('argument_order', { ascending: true });
    if (argsError) throw argsError;

    const sideAArgs = debateArgs?.filter(arg => arg.side === 'a') || [];
    const sideBArgs = debateArgs?.filter(arg => arg.side === 'b') || [];

    // AI prompt
    const prompt = `You are an expert debate judge. Analyze the debate "${debate.topic}".
Side A arguments: ${sideAArgs.map((a,i)=>`${i+1}. ${a.content}`).join('\n')}
Side B arguments: ${sideBArgs.map((a,i)=>`${i+1}. ${a.content}`).join('\n')}
Evaluate logic, evidence, persuasiveness. Respond with JSON:
{
  "side_a_score": number,
  "side_b_score": number,
  "side_a_logic_score": number,
  "side_a_evidence_score": number,
  "side_a_persuasion_score": number,
  "side_b_logic_score": number,
  "side_b_evidence_score": number,
  "side_b_persuasion_score": number,
  "winner": "a"|"b"|"tie",
  "reasoning": string
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert debate judge. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) throw new Error('AI evaluation failed');

    const aiResponse = await response.json();
    const evaluation = JSON.parse(aiResponse.choices[0].message.content);

    const resultData = {
      debateId,
      topic: debate.topic,
      timestamp: new Date().toISOString(),
      sideAScore: evaluation.side_a_score,
      sideBScore: evaluation.side_b_score,
      winner: evaluation.winner,
      reasoning: evaluation.reasoning
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(resultData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const resultHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const blockchainTxHash = `0x${resultHash}`;

    // Insert results
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

    // Update debate status
    await supabase
      .from('debates')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', debateId);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
