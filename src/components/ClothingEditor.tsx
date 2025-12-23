import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  Shirt,
  Loader2,
  Sparkles,
  User,
  Users,
  Briefcase,
  Crown,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClothingEditorProps {
  onClose: () => void;
}

type ClothingType = "formal-suit" | "formal-shirt" | "blazer" | "traditional" | "casual-smart";
type Gender = "male" | "female";

interface ClothingOption {
  id: ClothingType;
  name: string;
  description: string;
  icon: any;
}

const clothingOptions: ClothingOption[] = [
  { id: "formal-suit", name: "Formal Suit", description: "Professional business suit with tie", icon: Briefcase },
  { id: "formal-shirt", name: "Formal Shirt", description: "Crisp dress shirt for documents", icon: Shirt },
  { id: "blazer", name: "Smart Blazer", description: "Professional blazer look", icon: Crown },
  { id: "casual-smart", name: "Smart Casual", description: "Polo or casual button-down", icon: User },
  { id: "traditional", name: "Traditional", description: "Formal traditional attire", icon: Users },
];

const ClothingEditor = ({ onClose }: ClothingEditorProps) => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<ClothingType>("formal-suit");
  const [gender, setGender] = useState<Gender>("male");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
    toast({ title: "Photo uploaded", description: "Now select clothing type and generate." });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast({ title: "No image", description: "Please upload a photo first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-clothing", {
        body: {
          imageBase64: uploadedImage,
          clothingType: selectedClothing,
          gender,
          style: "indian"
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({ 
          title: "Generation failed", 
          description: data.error,
          variant: "destructive" 
        });
        return;
      }

      if (data.image) {
        setResultImage(data.image);
        toast({ title: "Success!", description: "Your professional photo is ready." });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to process image.",
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `professional-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded!", description: "Your professional photo has been saved." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center animate-pulse-glow">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold">AI Clothing Changer</h3>
              <p className="text-xs text-muted-foreground">Transform your casual photo into professional attire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {resultImage && (
              <button onClick={handleDownload} className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Use case banner */}
          <div className="mb-6 p-4 glass rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Perfect for Government Forms & Official Documents</p>
                <p className="text-xs text-muted-foreground">Transform your casual photo into a professional passport-style image</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Upload & Preview */}
            <div className="space-y-4">
              {!uploadedImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer group h-80 flex flex-col items-center justify-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <div className="w-20 h-20 rounded-full glass mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-lg font-medium mb-2">Upload your photo</p>
                    <p className="text-sm text-muted-foreground">Face should be clearly visible</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-center">Original Photo</p>
                      <div className="aspect-[3/4] rounded-xl overflow-hidden glass">
                        <img src={uploadedImage} alt="Original" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    {/* Result */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-center">Professional Result</p>
                      <div className="aspect-[3/4] rounded-xl overflow-hidden glass flex items-center justify-center">
                        {isProcessing ? (
                          <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">AI is working...</p>
                            <p className="text-xs text-muted-foreground">This may take 15-30 seconds</p>
                          </div>
                        ) : resultImage ? (
                          <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Shirt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Result will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setResultImage(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Upload different photo
                  </button>
                </div>
              )}
            </div>

            {/* Right - Controls */}
            <div className="space-y-6">
              {/* Gender selection */}
              <div className="p-4 glass rounded-xl">
                <label className="text-sm font-medium mb-3 block">Select Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "male" as const, label: "Male", icon: User },
                    { id: "female" as const, label: "Female", icon: Users },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={`p-4 rounded-xl transition-all flex items-center gap-3 ${
                        gender === g.id
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:bg-primary/10"
                      }`}
                    >
                      <g.icon className="w-5 h-5" />
                      <span className="font-medium">{g.label}</span>
                      {gender === g.id && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clothing options */}
              <div className="p-4 glass rounded-xl">
                <label className="text-sm font-medium mb-3 block">Choose Attire Style</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {clothingOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedClothing(option.id)}
                      className={`w-full p-4 rounded-xl transition-all flex items-center gap-4 text-left ${
                        selectedClothing === option.id
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:bg-primary/10"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedClothing === option.id ? "bg-white/20" : "bg-secondary"
                      }`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.name}</p>
                        <p className={`text-xs ${selectedClothing === option.id ? "opacity-80" : "text-muted-foreground"}`}>
                          {option.description}
                        </p>
                      </div>
                      {selectedClothing === option.id && <Check className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || isProcessing}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Professional Photo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Professional Photo
                  </>
                )}
              </button>

              {/* Tips */}
              <div className="p-4 glass rounded-xl">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Tips for Best Results
                </h5>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Use a clear, front-facing photo</li>
                  <li>• Good lighting helps AI accuracy</li>
                  <li>• Shoulders should be visible</li>
                  <li>• Plain background works best</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingEditor;
