import { useState, useRef } from "react";
import { X, Upload, Loader2, Download, Sparkles, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface AIStyleTransferEditorProps {
  onClose: () => void;
}

const styles = [
  { id: "anime", label: "Anime", description: "Japanese animation style" },
  { id: "watercolor", label: "Watercolor", description: "Soft painted look" },
  { id: "oil-painting", label: "Oil Painting", description: "Classic canvas texture" },
  { id: "pencil-sketch", label: "Pencil Sketch", description: "Hand-drawn effect" },
  { id: "pop-art", label: "Pop Art", description: "Bold colors, comic style" },
  { id: "cyberpunk", label: "Cyberpunk", description: "Neon futuristic look" },
  { id: "vintage", label: "Vintage", description: "Retro film aesthetic" },
  { id: "impressionist", label: "Impressionist", description: "Monet-inspired style" },
];

const AIStyleTransferEditor = ({ onClose }: AIStyleTransferEditorProps) => {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("anime");
  const [styleStrength, setStyleStrength] = useState(75);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setStyledImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStyleTransfer = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-edit", {
        body: {
          action: "styletransfer",
          imageUrl: originalImage,
          style: selectedStyle,
          strength: styleStrength,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setStyledImage(data.imageUrl);
        toast({ title: `${styles.find(s => s.id === selectedStyle)?.label} style applied!` });

        // Save to history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("editing_history").insert({
            user_id: user.id,
            original_image_url: originalImage,
            edited_image_url: data.imageUrl,
            tool_type: "styletransfer",
            settings: { style: selectedStyle, strength: styleStrength },
          });
        }
      }
    } catch (error) {
      console.error("Style transfer error:", error);
      toast({
        title: "Style transfer failed",
        description: "Could not apply style. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!styledImage) return;
    const link = document.createElement("a");
    link.href = styledImage;
    link.download = `styled-${selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold">AI Style Transfer</h3>
            <p className="text-sm text-muted-foreground">Transform photos into artistic styles</p>
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
          <p className="text-lg font-medium mb-2">Upload a photo to stylize</p>
          <p className="text-sm text-muted-foreground">Transform it into artistic masterpieces</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Style Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">Choose Style</h4>
            <div className="grid grid-cols-4 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    setStyledImage(null);
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedStyle === style.id
                      ? "bg-primary text-primary-foreground"
                      : "glass hover:bg-primary/10"
                  }`}
                >
                  <span className="text-sm font-medium block">{style.label}</span>
                  <span className="text-xs opacity-70 block mt-1">{style.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Strength */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Style Strength</label>
              <span className="text-xs text-muted-foreground">{styleStrength}%</span>
            </div>
            <input
              type="range"
              min={25}
              max={100}
              value={styleStrength}
              onChange={(e) => setStyleStrength(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Preview */}
          {styledImage ? (
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={styledImage}
              beforeLabel="Original"
              afterLabel={styles.find(s => s.id === selectedStyle)?.label || "Styled"}
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
                setStyledImage(null);
              }}
              className="px-4 py-2 rounded-lg glass hover:bg-secondary transition-colors"
            >
              Upload New
            </button>
            <button
              onClick={handleStyleTransfer}
              disabled={isProcessing}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Applying Style...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Apply {styles.find(s => s.id === selectedStyle)?.label} Style
                </>
              )}
            </button>
            {styledImage && (
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

export default AIStyleTransferEditor;
