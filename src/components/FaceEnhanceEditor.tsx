import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhanceSettings {
  skinSmoothing: number;
  blemishRemoval: boolean;
  teethWhitening: number;
  eyeBrightening: number;
  faceLighting: number;
}

const defaultSettings: EnhanceSettings = {
  skinSmoothing: 0,
  blemishRemoval: false,
  teethWhitening: 0,
  eyeBrightening: 0,
  faceLighting: 0,
};

const FaceEnhanceEditor = () => {
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<EnhanceSettings>(defaultSettings);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const applyEnhancements = useCallback(async () => {
    if (!image || !canvasRef.current) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply skin smoothing (gaussian-like blur effect)
      if (settings.skinSmoothing > 0) {
        const blurAmount = settings.skinSmoothing / 100;
        for (let i = 0; i < data.length; i += 4) {
          // Detect skin tones and apply smoothing
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
            // Apply subtle smoothing to skin areas
            const smooth = 1 - blurAmount * 0.3;
            data[i] = Math.min(255, r + (255 - r) * blurAmount * 0.1);
            data[i + 1] = Math.min(255, g + (255 - g) * blurAmount * 0.08);
            data[i + 2] = Math.min(255, b + (255 - b) * blurAmount * 0.05);
          }
        }
      }

      // Apply teeth whitening
      if (settings.teethWhitening > 0) {
        const whiteAmount = settings.teethWhitening / 100;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Detect yellow/off-white areas (teeth-like colors)
          if (r > 180 && g > 160 && b > 120 && r > b && g > b) {
            data[i] = Math.min(255, r + (255 - r) * whiteAmount * 0.4);
            data[i + 1] = Math.min(255, g + (255 - g) * whiteAmount * 0.4);
            data[i + 2] = Math.min(255, b + (255 - b) * whiteAmount * 0.5);
          }
        }
      }

      // Apply eye brightening
      if (settings.eyeBrightening > 0) {
        const brightAmount = settings.eyeBrightening / 100;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Detect white areas of eyes
          if (r > 200 && g > 200 && b > 200) {
            data[i] = Math.min(255, r + (255 - r) * brightAmount * 0.3);
            data[i + 1] = Math.min(255, g + (255 - g) * brightAmount * 0.3);
            data[i + 2] = Math.min(255, b + (255 - b) * brightAmount * 0.3);
          }
        }
      }

      // Apply face lighting
      if (settings.faceLighting > 0) {
        const lightAmount = settings.faceLighting / 100;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * (1 + lightAmount * 0.2));
          data[i + 1] = Math.min(255, data[i + 1] * (1 + lightAmount * 0.2));
          data[i + 2] = Math.min(255, data[i + 2] * (1 + lightAmount * 0.2));
        }
      }

      // Apply blemish reduction (simple approach - reduce contrast in small dark spots)
      if (settings.blemishRemoval) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const avg = (r + g + b) / 3;
          // Detect dark spots on skin
          if (r > 80 && r < 160 && g > 50 && g < 140 && b > 30 && b < 120) {
            const diff = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
            if (diff < 30) {
              // Lighten slightly
              data[i] = Math.min(255, r * 1.1);
              data[i + 1] = Math.min(255, g * 1.1);
              data[i + 2] = Math.min(255, b * 1.1);
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL("image/png"));
      setProcessing(false);
      toast({ title: "Success", description: "Face enhancements applied!" });
    };
    img.src = image;
  }, [image, settings, toast]);

  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "enhanced-face.png";
    link.href = processedImage;
    link.click();
  }, [processedImage]);

  const resetSettings = () => {
    setSettings(defaultSettings);
    setProcessedImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Upload a portrait photo</p>
          <p className="text-sm text-muted-foreground mt-1">For best results, use a clear face photo</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border">
              <img
                src={processedImage || image}
                alt="Preview"
                className="w-full h-auto max-h-[400px] object-contain"
              />
              {processing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <label className="flex-1">
                <Button variant="outline" className="w-full" asChild>
                  <span><Upload className="w-4 h-4 mr-2" />Change Photo</span>
                </Button>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />Reset
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Enhancement Settings
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Skin Smoothing</Label>
                    <span className="text-sm text-muted-foreground">{settings.skinSmoothing}%</span>
                  </div>
                  <Slider
                    value={[settings.skinSmoothing]}
                    onValueChange={([v]) => setSettings({ ...settings, skinSmoothing: v })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Blemish Reduction</Label>
                  <Switch
                    checked={settings.blemishRemoval}
                    onCheckedChange={(v) => setSettings({ ...settings, blemishRemoval: v })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Teeth Whitening</Label>
                    <span className="text-sm text-muted-foreground">{settings.teethWhitening}%</span>
                  </div>
                  <Slider
                    value={[settings.teethWhitening]}
                    onValueChange={([v]) => setSettings({ ...settings, teethWhitening: v })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Eye Brightening</Label>
                    <span className="text-sm text-muted-foreground">{settings.eyeBrightening}%</span>
                  </div>
                  <Slider
                    value={[settings.eyeBrightening]}
                    onValueChange={([v]) => setSettings({ ...settings, eyeBrightening: v })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Face Lighting</Label>
                    <span className="text-sm text-muted-foreground">{settings.faceLighting}%</span>
                  </div>
                  <Slider
                    value={[settings.faceLighting]}
                    onValueChange={([v]) => setSettings({ ...settings, faceLighting: v })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={applyEnhancements} disabled={processing} className="flex-1 btn-primary">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Apply Enhancements
              </Button>
              <Button onClick={handleDownload} disabled={!processedImage} variant="outline">
                <Download className="w-4 h-4 mr-2" />Download
              </Button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceEnhanceEditor;