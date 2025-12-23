import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, ImageOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const removeBackground = useCallback(async () => {
    if (!originalImage) return;

    setProcessing(true);
    setProgress(10);

    try {
      // Dynamic import for better performance
      const { pipeline, env } = await import("@huggingface/transformers");
      
      // Configure transformers.js
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      setProgress(30);
      toast({ title: "Loading AI model", description: "This may take a moment on first use..." });

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = originalImage;
      });

      setProgress(50);

      // Create canvas and resize if needed
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const MAX_DIM = 1024;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);

      setProgress(60);

      // Use segmentation model
      const segmenter = await pipeline(
        "image-segmentation",
        "Xenova/segformer-b0-finetuned-ade-512-512",
        { device: "webgpu" }
      );

      setProgress(80);

      const result = await segmenter(imageData);

      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error("Invalid segmentation result");
      }

      // Create output canvas
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext("2d");
      if (!outputCtx) throw new Error("Could not get output canvas context");

      outputCtx.drawImage(canvas, 0, 0);

      const outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;

      // Apply inverted mask to alpha channel
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }

      outputCtx.putImageData(outputImageData, 0, 0);
      setProgress(100);

      const resultUrl = outputCanvas.toDataURL("image/png");
      setProcessedImage(resultUrl);
      toast({ title: "Success!", description: "Background removed successfully." });
    } catch (error: any) {
      console.error("Background removal error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove background. Try a different image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [originalImage, toast]);

  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "no-background.png";
    link.href = processedImage;
    link.click();
  }, [processedImage]);

  return (
    <div className="space-y-6">
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
          {/* Image Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-3">
              <h3 className="font-medium text-center">Original</h3>
              <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border aspect-square flex items-center justify-center">
                <img
                  src={originalImage}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Result */}
            <div className="space-y-3">
              <h3 className="font-medium text-center">Result</h3>
              <div 
                className="relative rounded-xl overflow-hidden border border-border aspect-square flex items-center justify-center"
                style={{
                  backgroundImage: `repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%)`,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              >
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground text-center p-4">
                    {processing ? (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                        <p>Processing... {progress}%</p>
                      </div>
                    ) : (
                      <p>Result will appear here</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <label>
              <Button variant="outline" asChild>
                <span><Upload className="w-4 h-4 mr-2" />Change Image</span>
              </Button>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            
            <Button onClick={removeBackground} disabled={processing} className="btn-primary">
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Remove Background
            </Button>

            <Button onClick={handleDownload} disabled={!processedImage} variant="outline">
              <Download className="w-4 h-4 mr-2" />Download PNG
            </Button>
          </div>

          {/* Tips */}
          <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use clear, high-contrast images</li>
              <li>Works best with portraits and product photos</li>
              <li>First use may take longer as the AI model loads</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;