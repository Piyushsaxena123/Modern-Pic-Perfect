import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, backgroundType, backgroundColor, customBackground, prompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Build the AI prompt
    let aiPrompt = prompt || "";
    
    if (!aiPrompt) {
      if (backgroundType === "transparent") {
        aiPrompt = "Remove the background from this image completely. Make the background fully transparent, keeping only the main subject (person or object). The result should look professional with clean edges around the subject.";
      } else if (backgroundType === "color") {
        const colorName = backgroundColor === "#FFFFFF" ? "pure white" : 
                         backgroundColor === "#E3F2FD" ? "light blue" :
                         backgroundColor === "#F5F5F5" ? "light gray" :
                         backgroundColor === "#1976D2" ? "blue" :
                         backgroundColor === "#D32F2F" ? "red" :
                         backgroundColor === "#388E3C" ? "green" :
                         backgroundColor === "#1A237E" ? "navy blue" :
                         backgroundColor === "#7B1FA2" ? "maroon/purple" : "the specified color";
        
        aiPrompt = `Remove the current background and replace it with a solid ${colorName} background (hex: ${backgroundColor}). Keep only the main subject (person or object) with clean edges. The result should look professional and suitable for official documents, passport photos, or ID cards.`;
      } else if (backgroundType === "custom") {
        aiPrompt = "Remove the background from this image and prepare the subject with clean, precise edges for compositing onto a new background.";
      }
    }

    console.log("Sending background removal request with prompt:", aiPrompt);

    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: aiPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          }
        ]
      }
    ];

    // If custom background is provided, include it for compositing
    if (backgroundType === "custom" && customBackground) {
      messages[0].content[0].text = "Remove the background from the first image (the subject) and place it naturally onto the second image (the background). Make sure the subject blends well with the new background, adjusting lighting and scale appropriately.";
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: customBackground
        }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages,
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI background removal response received");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.log("No image in response, text:", textResponse);
      return new Response(
        JSON.stringify({ 
          error: "Could not process background. The AI may not have been able to properly segment this image.",
          details: textResponse 
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        image: generatedImage,
        message: textResponse || "Background processed successfully!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-background function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});