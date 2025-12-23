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
    
    // School Uniform Variations
    if (clothingType === "school-uniform") {
      prompt += `Replace their current outfit with a school uniform. `;
      if (gender === "male") {
        prompt += `Add a neat white formal shirt with a school tie (navy blue or maroon striped), dark navy blue or black formal pants, and a school blazer. The uniform should look like a typical formal school uniform suitable for school ID photos.`;
      } else {
        prompt += `Add a neat white formal shirt or blouse with a school tie (navy blue or maroon striped), and a formal school pinafore or skirt with blazer. The uniform should look like a typical formal school uniform suitable for school ID photos.`;
      }
    } else if (clothingType === "school-navy-tie") {
      prompt += `Replace their current outfit with a school uniform with a NAVY BLUE striped tie. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a navy blue striped school tie, dark formal pants, and optionally a navy blazer. The uniform should look neat and formal for school ID photos.`;
      } else {
        prompt += `Add a crisp white blouse with a navy blue striped school tie, formal skirt or pinafore, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-red-tie") {
      prompt += `Replace their current outfit with a school uniform with a RED/MAROON striped tie. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a red or maroon striped school tie, dark formal pants. The uniform should look neat and formal for school ID photos.`;
      } else {
        prompt += `Add a crisp white blouse with a red or maroon striped school tie, formal skirt or pinafore, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-green-tie") {
      prompt += `Replace their current outfit with a school uniform with a GREEN striped tie. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a bottle green striped school tie, dark formal pants. The uniform should look neat and formal for school ID photos.`;
      } else {
        prompt += `Add a crisp white blouse with a bottle green striped school tie, formal skirt or pinafore, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-maroon-tie") {
      prompt += `Replace their current outfit with a school uniform with a MAROON/BURGUNDY tie. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a maroon or burgundy striped school tie, dark formal pants. The uniform should look neat and formal for school ID photos.`;
      } else {
        prompt += `Add a crisp white blouse with a maroon or burgundy striped school tie, formal skirt or pinafore, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-blazer-navy") {
      prompt += `Replace their current outfit with a school uniform with a NAVY BLUE BLAZER. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a tie, dark formal pants, and a navy blue school blazer with a school crest/emblem. The uniform should look prestigious and formal.`;
      } else {
        prompt += `Add a crisp white blouse with a tie, formal skirt, and a navy blue school blazer with emblem, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-blazer-maroon") {
      prompt += `Replace their current outfit with a school uniform with a MAROON BLAZER. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a tie, dark formal pants, and a maroon/burgundy school blazer with a school crest. The uniform should look prestigious and formal.`;
      } else {
        prompt += `Add a crisp white blouse with a tie, formal skirt, and a maroon school blazer with emblem, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-blazer-green") {
      prompt += `Replace their current outfit with a school uniform with a BOTTLE GREEN BLAZER. `;
      if (gender === "male") {
        prompt += `Add a crisp white formal shirt with a tie, dark formal pants, and a bottle green school blazer with a school crest. The uniform should look prestigious and formal.`;
      } else {
        prompt += `Add a crisp white blouse with a tie, formal skirt, and a bottle green school blazer with emblem, suitable for school ID photos.`;
      }
    } else if (clothingType === "school-sweater") {
      prompt += `Replace their current outfit with a school uniform featuring a V-NECK SWEATER. `;
      if (gender === "male") {
        prompt += `Add a white formal shirt with a tie visible at the collar, a navy or maroon V-neck school sweater over it, and formal pants. The look should be neat and suitable for cooler weather school photos.`;
      } else {
        prompt += `Add a white blouse with a tie visible at the collar, a navy or maroon V-neck school sweater over it, and formal skirt. The look should be neat and suitable for school photos.`;
      }
    } else if (clothingType === "school-cardigan") {
      prompt += `Replace their current outfit with a school uniform featuring a CARDIGAN. `;
      if (gender === "male") {
        prompt += `Add a white formal shirt with a tie, a dark colored school cardigan, and formal pants. The look should be smart and academic.`;
      } else {
        prompt += `Add a white blouse with a tie, a dark colored school cardigan, and formal skirt. The look should be smart and suitable for school photos.`;
      }
    } else if (clothingType === "office-tie") {
      prompt += `Replace their current outfit with professional office attire with a tie. `;
      if (gender === "male") {
        prompt += `Add a crisp white or light blue formal dress shirt with a professional necktie (solid color or subtle pattern), and ensure the collar is neat and the tie is properly knotted. This should look like a professional office worker ready for an important meeting.`;
      } else {
        prompt += `Add a professional blouse with a feminine necktie or bow tie, or a formal blazer with a professional look. The outfit should be suitable for a corporate office environment.`;
      }
    } else if (clothingType === "formal-suit") {
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
    } else if (clothingType === "traditional-kurta") {
      prompt += `Change their outfit to a KURTA PAJAMA. `;
      if (gender === "male") {
        prompt += `Add an elegant kurta (long tunic) in a rich color like cream, beige, or pastel, paired with churidar or pajama pants. The kurta should have subtle embroidery or be plain silk. This is traditional Indian formal wear.`;
      } else {
        prompt += `Add an elegant kurti or kurta in a rich color with churidar. The outfit should look traditional and elegant.`;
      }
    } else if (clothingType === "traditional-sherwani") {
      prompt += `Change their outfit to a SHERWANI. `;
      if (gender === "male") {
        prompt += `Add a royal sherwani - a long coat-like garment in a rich color (gold, maroon, navy, or cream) with intricate embroidery, paired with churidar pants. This is premium Indian formal wear for weddings and special occasions.`;
      } else {
        prompt += `Add an elegant formal traditional outfit with rich embroidery, suitable for formal occasions.`;
      }
    } else if (clothingType === "traditional-nehru") {
      prompt += `Change their outfit to a NEHRU JACKET / BANDHGALA. `;
      if (gender === "male") {
        prompt += `Add a Nehru jacket (bandhgala) - a closed-collar formal jacket in a solid color like black, navy, or beige, worn over a formal kurta or shirt. This is a sophisticated Indian formal wear.`;
      } else {
        prompt += `Add a formal Nehru-style jacket over a traditional blouse or kurta, creating an elegant Indo-western look.`;
      }
    } else if (clothingType === "traditional-saree") {
      prompt += `Change their outfit to a SAREE. `;
      if (gender === "female") {
        prompt += `Add an elegant silk saree in a rich color (like red, gold, green, or blue) with a matching blouse. The saree should be draped beautifully and look suitable for formal occasions. Include traditional jewelry if appropriate.`;
      } else {
        prompt += `Add traditional formal wear suitable for the person.`;
      }
    } else if (clothingType === "traditional-salwar") {
      prompt += `Change their outfit to SALWAR KAMEEZ. `;
      if (gender === "female") {
        prompt += `Add an elegant salwar kameez (tunic with loose pants) in a beautiful color with embroidery or prints. Include a dupatta (scarf). This is comfortable yet elegant traditional Indian wear.`;
      } else {
        prompt += `Add a traditional kurta with pajama pants, suitable for formal occasions.`;
      }
    } else if (clothingType === "traditional-lehenga") {
      prompt += `Change their outfit to a LEHENGA CHOLI. `;
      if (gender === "female") {
        prompt += `Add a beautiful lehenga choli - a long skirt (lehenga) with a fitted blouse (choli) and dupatta. Use rich colors like red, maroon, pink, or gold with embroidery. This is festive Indian wear for weddings and celebrations.`;
      } else {
        prompt += `Add traditional festive formal wear suitable for celebrations.`;
      }
    } else if (clothingType === "traditional-dhoti") {
      prompt += `Change their outfit to DHOTI KURTA. `;
      if (gender === "male") {
        prompt += `Add a traditional dhoti (wrapped lower garment in white or cream) with a formal kurta on top. This is a classic traditional Indian outfit often worn for religious or formal ceremonies.`;
      } else {
        prompt += `Add traditional elegant wear suitable for formal occasions.`;
      }
    } else if (clothingType === "casual-smart") {
      prompt += `Change their outfit to smart casual wear. `;
      prompt += `Add a polo shirt or casual button-down shirt that looks neat and presentable.`;
    } else {
      // Fallback for any unrecognized type - default to formal shirt
      prompt += `Replace their current outfit with a formal white dress shirt with a professional tie, suitable for official document photos.`;
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