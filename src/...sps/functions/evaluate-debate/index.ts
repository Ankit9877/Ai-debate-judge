import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight Request Handler
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { debateId } = await req.json();
    
    if (!debateId) {
      throw new Error('Debate ID is required');
    }

    // --- FIX 1: Use GEMINI_API_KEY and add check ---
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    // SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY are provided automatically by Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!; 
    // --- END FIX 1 ---
    
    // Client using Service Role Key (for privileged read/write operations)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- START: USER AUTHENTICATION AND AUTHORIZATION (UNCHANGED) ---
    
    // 1. Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.split(' ')[1];

    // 2. Create a client scoped to the user's token
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    
    // 3. Get the user object from the JWT
    const { data: userData, error: userError } = await userSupabase.auth.getUser(token);

    if (userError || !userData.user) {
        return new Response(JSON.stringify({ error: `Authentication failed: ${userError?.message || 'Invalid user data'}` }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const userId = userData.user.id;
    
    // 4. Check if the authenticated user is a participant in this debate
    const { data: participantsData, error: participantsError } = await supabase
      .from('debate_participants')
      .select('user_id')
      .eq('debate_id', debateId)
      .eq('user_id', userId);

    if (participantsError) throw participantsError;
    
    if (!participantsData || participantsData.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not authorized to evaluate this debate.' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- END: USER AUTHENTICATION AND AUTHORIZATION ---


    // Fetch debate and arguments
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

    // Prepare prompt for AI Judge
    const prompt = `You are an expert debate judge. Analyze the following debate and provide a comprehensive evaluation.

Topic: ${debate.topic}
Description: ${debate.description || 'N/A'}

${debate.side_a_name} Arguments:
${sideAArgs.map((arg, i) => `${i + 1}. ${arg.content}`).join('\n')}

${debate.side_b_name} Arguments:
${sideBArgs.map((arg, i) => `${i + 1}. ${arg.content}`).join('\n')}

Evaluate both sides on:
1. Logic and reasoning (0-100)
2. Evidence and facts (0-100)
3. Persuasiveness (0-100)

Provide:
- Overall scores for each side (0-100)
- Individual scores for logic, evidence, and persuasiveness for each side
- Winner (a, b, or tie)
- Detailed reasoning (2-3 paragraphs)

Respond in JSON format with the specified schema.`;

    // --- FIX 2: Call Google Gemini API directly with JSON Schema ---
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
            { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
            systemInstruction: 'You are an expert debate judge. Always respond with valid JSON only.',
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    side_a_score: { type: "NUMBER" },
                    side_b_score: { type: "NUMBER" },
                    side_a_logic_score: { type: "NUMBER" },
                    side_a_evidence_score: { type: "NUMBER" },
                    side_a_persuasion_score: { type: "NUMBER" },
                    side_b_logic_score: { type: "NUMBER" },
                    side_b_evidence_score: { type: "NUMBER" },
                    side_b_persuasion_score: { type: "NUMBER" },
                    winner: { type: "STRING", enum: ["a", "b", "tie"] },
                    reasoning: { type: "STRING" }
                },
                required: [
                    "side_a_score", "side_b_score", "side_a_logic_score", 
                    "side_a_evidence_score", "side_a_persuasion_score", 
                    "side_b_logic_score", "side_b_evidence_score", 
                    "side_b_persuasion_score", "winner", "reasoning"
                ]
            }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to evaluate debate with AI: ' + errorText);
    }

    const aiResponse = await response.json();
    
    // Parse AI response from the Gemini structure
    const content = aiResponse.candidates[0].content.parts[0].text;
    const evaluation = JSON.parse(content);
    // --- END FIX 2 ---
    
    // Create a verifiable hash of the debate result
    const resultData = {
      debateId,
      topic: debate.topic,
      timestamp: new Date().toISOString(),
      sideAScore: evaluation.side_a_score,
      sideBScore: evaluation.side_b_score,
      winner: evaluation.winner,
      reasoning: evaluation.reasoning
    };
    
    // Create SHA-256 hash of the result data for blockchain verification
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(resultData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const resultHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // In a real implementation, this hash would be submitted to a blockchain
    const blockchainTxHash = `0x${resultHash}`;

    // Store results in database
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
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', debateId);

    return new Response(JSON.stringify({ success: true, result }), {
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