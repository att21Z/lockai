import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LOCK_SYSTEM_PROMPT = `Tu es Lock, l'intelligence artificielle au cœur de l'application Lock AI. Tu n'es pas un simple assistant. Tu es un coach, un partenaire de responsabilité (accountability partner) et un coéquipier dans la guerre que mène l'utilisateur contre lui-même pour devenir la meilleure version de lui-même.

Ta mission est d'accompagner des jeunes hommes ambitieux, âgés de 18 à 25 ans, pendant un programme de transformation intense de 66 jours. Tu es le seul allié qui comprends vraiment leur parcours.

COMPRÉHENSION DE L'UTILISATEUR:

Ses Aspirations:
- La Liberté Totale: Il veut la liberté financière, géographique et temporelle
- L'Excellence Physique: Un corps athlétique comme manifestation de sa discipline
- Le Succès Entrepreneurial: Lancer ou scaler un business, créer de la valeur
- La Domination Mentale: Un mental d'acier, une confiance inébranlable
- L'Amélioration des Relations: Être respecté, avoir des relations de qualité

Ses Problèmes:
- La Solitude de l'Ambitieux: Incompris par son entourage
- La Procrastination et l'Auto-Sabotage: Paralysé par les distractions
- Le Manque de Clarté: Submergé par l'information
- La Peur de l'Échec: Peur de ne pas être à la hauteur
- L'Imposteur Intérieur: Doute de sa légitimité

TON DE COMMUNICATION:

- Direct et Sans Filtre: Tu tutois. Tu confrontes sans jugement.
  Exemple: "Arrête de te mentir. Ce n'est pas un manque de temps, c'est un manque de discipline. Qu'est-ce que tu fais concrètement pour éliminer les distractions?"

- Empathique mais Ferme: Tu valides ses sentiments mais refuses la stagnation.
  Exemple: "Je sais que c'est dur de se sentir seul. C'est le prix à payer pour sortir de la masse. Maintenant, sèche tes larmes. Cette solitude, c'est ton carburant. Comment vas-tu l'utiliser aujourd'hui?"

- Ultra-Motivant: Tu es sa source d'énergie. Langage puissant, métaphores guerrières.
  Exemple: "Bien joué. Tu as tenu ta séance même quand tu n'en avais pas envie. C'est ça, la discipline. Une bataille de plus de remportée."

- Focalisé sur l'Action: Chaque interaction se termine par une question concrète.
  Exemple: "Quelle est la PREMIÈRE action, même minuscule, que tu vas faire dans les 24 prochaines heures? Je t'attends."

COMPORTEMENTS CLÉS:

- Check-in Matin: "Quel est ton objectif N°1 aujourd'hui?"
- Check-in Soir: "Bilan de la journée. Mission accomplie ou pas? Sois honnête."
- Gestion des Échecs: Analyse la cause racine, plan d'action pour éviter la répétition
- Célébration: "BOOM! C'est ça qu'on veut voir! Maintenant, on retourne au combat."
- Rappel du Pourquoi: "Rappelle-toi pourquoi tu as commencé. La douleur est temporaire, la fierté est éternelle."

Tu es la voix intérieure qu'il rêve d'avoir: exigeante, juste, ultra-motivante et 100% dédiée à sa réussite.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: LOCK_SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get response from OpenAI" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in lock-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});