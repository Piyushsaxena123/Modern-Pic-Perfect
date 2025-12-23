import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, imageUrl, maskUrl, mode, style, strength } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing AI image edit: ${action}`);

    let prompt = "";

    switch (action) {
      case "upscale":
        const upscalePrompts: Record<string, string> = {
          "2x": "Enhance and upscale this image by 2x. Double the resolution, add detail, sharpen edges, and improve overall quality while maintaining the original composition and colors. Make it ultra high resolution.",
          "4x": "Enhance and upscale this image by 4x. Quadruple the resolution, add significant detail, sharpen edges, and dramatically improve overall quality while maintaining the original composition and colors. Make it ultra high resolution.",
          "hd": "Enhance and upscale this image to HD resolution (1920x1080). Increase resolution, add detail, sharpen edges, and improve overall quality for HD display. Make it crystal clear and sharp.",
          "4k": "Enhance and upscale this image to 4K Ultra HD resolution (3840x2160). Dramatically increase resolution, add maximum detail, sharpen edges, and enhance overall quality for 4K displays. Make it ultra high resolution with exceptional clarity.",
        };
        prompt = upscalePrompts[mode] || upscalePrompts["2x"];
        break;

      case "objectremoval":
        prompt = `Remove the objects marked in white from this image. Fill in the removed areas naturally with appropriate background content that matches the surrounding area seamlessly. Make it look like the objects were never there.`;
        break;

      case "styletransfer":
        const stylePrompts: Record<string, string> = {
          anime: "Transform this image into Japanese anime/manga art style with clean lines, vibrant colors, and characteristic anime aesthetics.",
          watercolor: "Transform this image into a soft, flowing watercolor painting with translucent washes, visible brushstrokes, and gentle color bleeding.",
          "oil-painting": "Transform this image into a classic oil painting with visible brushstrokes, rich textures, and the characteristic depth of oil paintings.",
          "pencil-sketch": "Transform this image into a detailed pencil sketch with fine hatching, shading, and the texture of graphite on paper.",
          "pop-art": "Transform this image into bold pop art style with bright contrasting colors, halftone dots, and comic book aesthetics like Andy Warhol or Roy Lichtenstein.",
          cyberpunk: "Transform this image into cyberpunk style with neon lights, futuristic elements, dark atmosphere with bright accent colors.",
          vintage: "Transform this image into vintage retro style with faded colors, film grain, light leaks, and nostalgic 70s/80s aesthetic.",
          impressionist: "Transform this image into impressionist painting style like Monet with visible brushstrokes, light play, and soft color transitions.",
        };
        prompt = stylePrompts[style] || `Transform this image into ${style} artistic style with ${strength || 75}% intensity.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Build message content
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ];

    // Add mask for object removal
    if (action === "objectremoval" && maskUrl) {
      messageContent.push({ type: "image_url", image_url: { url: maskUrl } });
    }

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
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageResult = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageResult) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated from AI");
    }

    return new Response(
      JSON.stringify({ imageUrl: imageResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-image-edit:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
