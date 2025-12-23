import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, clothingType, gender, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Build the prompt for clothing change
    let prompt = `Edit this person's photo to change their clothing. `;
    
    if (clothingType === "formal-suit") {
      prompt += `Replace their current outfit with a professional formal business suit. `;
      if (gender === "male") {
        prompt += `Add a navy blue or charcoal grey formal suit with a white dress shirt, a professional tie, and make sure the person looks professional and ready for a formal occasion or government document photo.`;
      } else {
        prompt += `Add a professional formal blazer with a modest blouse or formal dress, making the person look professional and suitable for a formal occasion or government document photo.`;
      }
    } else if (clothingType === "formal-shirt") {
      prompt += `Replace their current top with a formal dress shirt. `;
      if (gender === "male") {
        prompt += `Add a crisp white or light blue formal dress shirt, optionally with a professional tie, suitable for passport photos or government forms.`;
      } else {
        prompt += `Add a formal blouse or collared shirt that looks professional and suitable for official document photos.`;
      }
    } else if (clothingType === "blazer") {
      prompt += `Add a professional blazer over their current or new formal attire. `;
      prompt += `Make it look like a smart business casual or semi-formal look suitable for professional settings.`;
    } else if (clothingType === "traditional") {
      prompt += `Change their outfit to traditional formal wear. `;
      if (style === "indian") {
        if (gender === "male") {
          prompt += `Add a formal kurta or sherwani suitable for formal occasions.`;
        } else {
          prompt += `Add a formal saree or salwar kameez suitable for formal occasions.`;
        }
      } else {
        prompt += `Add appropriate traditional formal attire for their culture.`;
      }
    } else if (clothingType === "casual-smart") {
      prompt += `Change their outfit to smart casual wear. `;
      prompt += `Add a polo shirt or casual button-down shirt that looks neat and presentable.`;
    }

    prompt += ` Keep the person's face, hair, and expression exactly the same. Only change the clothing. The photo should look natural and realistic, suitable for official documents or professional use.`;

    console.log("Sending request to Lovable AI with prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
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
    console.log("AI response received successfully");

    // Extract the generated image
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.log("No image in response, text:", textResponse);
      return new Response(
        JSON.stringify({ 
          error: "Could not generate clothing change. The AI model may not have been able to process this image properly.",
          details: textResponse 
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        image: generatedImage,
        message: textResponse || "Clothing changed successfully!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-clothing function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
