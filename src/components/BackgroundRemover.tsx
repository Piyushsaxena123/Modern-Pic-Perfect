import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, ImageOff, Sparkles, Palette, Image as ImageIcon, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { removeBackground, loadImageFromUrl } from "@/lib/backgroundRemoval";

type BackgroundType = "transparent" | "color" | "custom";

const colorOptions = [
  // Basic Colors
  { id: "white", color: "#FFFFFF", name: "White" },
  { id: "black", color: "#000000", name: "Black" },
  { id: "lightgray", color: "#F5F5F5", name: "Light Gray" },
  { id: "darkgray", color: "#424242", name: "Dark Gray" },
  
  // Blues
  { id: "lightblue", color: "#E3F2FD", name: "Light Blue" },
  { id: "skyblue", color: "#87CEEB", name: "Sky Blue" },
  { id: "blue", color: "#1976D2", name: "Blue" },
  { id: "navy", color: "#1A237E", name: "Navy" },
  { id: "teal", color: "#00695C", name: "Teal" },
  
  // Warm Colors
  { id: "red", color: "#D32F2F", name: "Red" },
  { id: "maroon", color: "#7B1FA2", name: "Maroon" },
  { id: "orange", color: "#F57C00", name: "Orange" },
  { id: "yellow", color: "#FBC02D", name: "Yellow" },
  { id: "cream", color: "#FFFDD0", name: "Cream" },
  
  // Greens
  { id: "green", color: "#388E3C", name: "Green" },
  { id: "lightgreen", color: "#C8E6C9", name: "Light Green" },
  { id: "olive", color: "#808000", name: "Olive" },
  
  // Other
  { id: "pink", color: "#E91E63", name: "Pink" },
  { id: "purple", color: "#7B1FA2", name: "Purple" },
  { id: "brown", color: "#795548", name: "Brown" },
  { id: "beige", color: "#F5F5DC", name: "Beige" },
];

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("transparent");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleCustomBgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBackground(event.target?.result as string);
        setBackgroundType("custom");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processBackground = useCallback(async () => {
    if (!originalImage) return;

    setProcessing(true);
    setLoadingModel(true);

    try {
      toast({ title: "Loading AI model...", description: "This may take a moment on first use." });
      
      // Load the original image
      const imgElement = await loadImageFromUrl(originalImage);
      setLoadingModel(false);
      
      // Load custom background if needed
      let backgroundImage: HTMLImageElement | undefined;
      if (backgroundType === "custom" && customBackground) {
        backgroundImage = await loadImageFromUrl(customBackground);
      }

      // Process with in-browser AI
      const resultBlob = await removeBackground(imgElement, {
        backgroundColor: backgroundType === "color" ? selectedColor : undefined,
        backgroundImage: backgroundImage,
      });

      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onload = () => {
        setProcessedImage(reader.result as string);
        toast({ title: "Success!", description: "Background processed successfully." });
      };
      reader.readAsDataURL(resultBlob);

    } catch (error: any) {
      console.error("Background removal error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process background. Try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setLoadingModel(false);
    }
  }, [originalImage, backgroundType, selectedColor, customBackground, toast]);

  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "edited-background.png";
    link.href = processedImage;
    link.click();
  }, [processedImage]);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 glass rounded-xl border border-primary/20">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Powered by On-Device AI</p>
            <p className="text-xs text-muted-foreground">Your images are processed locally - never uploaded to any server</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!originalImage ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
          <ImageOff className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Upload an image</p>
          <p className="text-sm text-muted-foreground mt-1">Perfect for passport photos & product images</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Image Preview */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <h3 className="font-medium text-center text-sm">Original</h3>
                  <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border aspect-square flex items-center justify-center">
                    <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-2">
                  <h3 className="font-medium text-center text-sm">Result</h3>
                  <div 
                    className="relative rounded-xl overflow-hidden border border-border aspect-square flex items-center justify-center"
                    style={{
                      background: backgroundType === "transparent" 
                        ? `repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%)`
                        : backgroundType === "color" 
                        ? selectedColor
                        : customBackground 
                        ? `url(${customBackground}) center/cover`
                        : `repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%)`,
                      backgroundSize: backgroundType === "transparent" ? "20px 20px" : undefined,
                    }}
                  >
                    {processedImage ? (
                      <img src={processedImage} alt="Result" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-muted-foreground text-center p-4">
                        {processing ? (
                          <div className="space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                            <p className="text-sm">{loadingModel ? "Loading AI model..." : "Processing..."}</p>
                            {loadingModel && <p className="text-xs">First time may take 30-60 seconds</p>}
                          </div>
                        ) : (
                          <p className="text-sm">Result will appear here</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <label className="flex-1">
                  <Button variant="outline" className="w-full" asChild>
                    <span><Upload className="w-4 h-4 mr-2" />Change Image</span>
                  </Button>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <Button onClick={handleDownload} disabled={!processedImage} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="space-y-6">
              {/* Background Type */}
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Background Options
                </h3>

                <div className="space-y-3">
                  {/* Transparent */}
                  <button
                    onClick={() => setBackgroundType("transparent")}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      backgroundType === "transparent" ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-dashed"
                      style={{
                        background: `repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)`,
                        backgroundSize: "10px 10px",
                      }}
                    />
                    <div className="text-left flex-1">
                      <p className="font-medium">Transparent</p>
                      <p className="text-xs opacity-80">Remove background completely</p>
                    </div>
                  </button>

                  {/* Color Background */}
                  <button
                    onClick={() => setBackgroundType("color")}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      backgroundType === "color" ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: selectedColor, border: "2px solid rgba(255,255,255,0.3)" }} />
                    <div className="text-left flex-1">
                      <p className="font-medium">Solid Color</p>
                      <p className="text-xs opacity-80">Replace with a color background</p>
                    </div>
                  </button>

                  {/* Color Picker */}
                  {backgroundType === "color" && (
                    <div className="p-3 glass rounded-xl space-y-3">
                      <div className="grid grid-cols-7 gap-2">
                        {colorOptions.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedColor(c.color);
                              setShowColorPicker(false);
                            }}
                            className={`aspect-square rounded-lg transition-all ${
                              selectedColor === c.color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.color, border: "1px solid rgba(0,0,0,0.15)" }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      
                      {/* Custom Color Picker */}
                      <div className="pt-2 border-t border-border">
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <span className="text-sm font-medium">Custom Color</span>
                          <div 
                            className="w-6 h-6 rounded-lg border-2 border-border"
                            style={{ backgroundColor: customColor }}
                          />
                        </button>
                        
                        {showColorPicker && (
                          <div className="mt-2 space-y-2">
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => {
                                setCustomColor(e.target.value);
                                setSelectedColor(e.target.value);
                              }}
                              className="w-full h-10 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={customColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                  setCustomColor(val);
                                  if (val.length === 7) setSelectedColor(val);
                                }
                              }}
                              placeholder="#FFFFFF"
                              className="w-full p-2 rounded-lg bg-secondary text-sm text-center font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Background */}
                  <button
                    onClick={() => customBgInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      backgroundType === "custom" ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                    }`}
                  >
                    {customBackground ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <img src={customBackground} alt="Custom" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-left flex-1">
                      <p className="font-medium">Custom Background</p>
                      <p className="text-xs opacity-80">Upload your own background image</p>
                    </div>
                  </button>
                  <input
                    ref={customBgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Process Button */}
              <Button onClick={processBackground} disabled={processing} className="w-full h-14 text-lg btn-primary">
                {processing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{loadingModel ? "Loading Model..." : "Processing..."}</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" />Remove & Replace Background</>
                )}
              </Button>

              {/* Tips */}
              <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Tips for best results:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use clear, high-contrast images</li>
                  <li>Works best with portraits and product photos</li>
                  <li>First processing loads the AI model (30-60 sec)</li>
                  <li>Subsequent processing is much faster</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;
