import { useState, useRef } from "react";
import { X, Upload, Loader2, Download, Sparkles, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface AIUpscaleEditorProps {
  onClose: () => void;
}

const AIUpscaleEditor = ({ onClose }: AIUpscaleEditorProps) => {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState<2 | 4>(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setUpscaledImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-edit", {
        body: {
          action: "upscale",
          imageUrl: originalImage,
          scale,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setUpscaledImage(data.imageUrl);
        toast({ title: `Image upscaled ${scale}x successfully!` });

        // Save to history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("editing_history").insert({
            user_id: user.id,
            original_image_url: originalImage,
            edited_image_url: data.imageUrl,
            tool_type: "upscale",
            settings: { scale },
          });
        }
      }
    } catch (error) {
      console.error("Upscale error:", error);
      toast({
        title: "Upscale failed",
        description: "Could not upscale the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!upscaledImage) return;
    const link = document.createElement("a");
    link.href = upscaledImage;
    link.download = `upscaled-${scale}x.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold">AI Image Upscaler</h3>
            <p className="text-sm text-muted-foreground">Enhance low-resolution images with AI</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!originalImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">Upload an image to upscale</p>
          <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scale Selection */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Upscale Factor:</span>
            <div className="flex gap-2">
              {([2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    scale === s
                      ? "bg-primary text-primary-foreground"
                      : "glass hover:bg-primary/10"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {upscaledImage ? (
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={upscaledImage}
              beforeLabel="Original"
              afterLabel={`${scale}x Upscaled`}
            />
          ) : (
            <div className="aspect-video rounded-2xl overflow-hidden glass">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOriginalImage(null);
                setUpscaledImage(null);
              }}
              className="px-4 py-2 rounded-lg glass hover:bg-secondary transition-colors"
            >
              Upload New
            </button>
            <button
              onClick={handleUpscale}
              disabled={isProcessing}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upscaling...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Upscale {scale}x
                </>
              )}
            </button>
            {upscaledImage && (
              <button
                onClick={downloadImage}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIUpscaleEditor;
