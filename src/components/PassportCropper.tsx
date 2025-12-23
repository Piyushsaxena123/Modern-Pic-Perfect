import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, Move, Check, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CropSize {
  id: string;
  name: string;
  widthMM: number;
  heightMM: number;
  widthInch: number;
  heightInch: number;
  description: string;
}

const passportSizes: CropSize[] = [
  { id: "us", name: "US Passport", widthMM: 51, heightMM: 51, widthInch: 2, heightInch: 2, description: "2×2 inch (USA, India)" },
  { id: "uk", name: "UK/EU Passport", widthMM: 35, heightMM: 45, widthInch: 1.38, heightInch: 1.77, description: "35×45 mm (UK, EU, Schengen)" },
  { id: "china", name: "Chinese Passport", widthMM: 33, heightMM: 48, widthInch: 1.3, heightInch: 1.89, description: "33×48 mm (China)" },
  { id: "japan", name: "Japanese Passport", widthMM: 35, heightMM: 45, widthInch: 1.38, heightInch: 1.77, description: "35×45 mm (Japan)" },
  { id: "canada", name: "Canadian Passport", widthMM: 50, heightMM: 70, widthInch: 1.97, heightInch: 2.76, description: "50×70 mm (Canada)" },
  { id: "australia", name: "Australian Passport", widthMM: 35, heightMM: 45, widthInch: 1.38, heightInch: 1.77, description: "35×45 mm (Australia)" },
];

const PassportCropper = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<CropSize>(passportSizes[0]);
  const [processing, setProcessing] = useState(false);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
        setCroppedImage(null);
        setImagePos({ x: 0, y: 0 });
        setImageScale(1);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  // Auto-center the image when loaded
  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Auto-center and scale to fit
        const aspectRatio = selectedSize.widthMM / selectedSize.heightMM;
        const imgAspect = img.width / img.height;
        
        let scale = 1;
        if (imgAspect > aspectRatio) {
          scale = 300 / img.height; // Fit by height
        } else {
          scale = (300 * aspectRatio) / img.width; // Fit by width
        }
        setImageScale(Math.max(scale, 0.5));
        setImagePos({ x: 0, y: 0 });
      };
      img.src = originalImage;
    }
  }, [originalImage, selectedSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = useCallback(() => {
    if (!originalImage || !imageRef.current || !canvasRef.current) return;

    setProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Output at 600 DPI for high quality
      const dpi = 600;
      const outputWidth = Math.round((selectedSize.widthInch * dpi));
      const outputHeight = Math.round((selectedSize.heightInch * dpi));

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      const img = imageRef.current;
      const previewAspect = selectedSize.widthMM / selectedSize.heightMM;
      const previewWidth = 300 * previewAspect;
      const previewHeight = 300;

      // Scale from preview coordinates to output coordinates
      const scaleToOutput = outputWidth / previewWidth;

      // Calculate the source crop area based on current position and scale
      const scaledImgWidth = img.width * imageScale;
      const scaledImgHeight = img.height * imageScale;

      // Center position in preview
      const imgCenterX = previewWidth / 2 + imagePos.x;
      const imgCenterY = previewHeight / 2 + imagePos.y;

      // Draw the image centered and scaled
      const drawWidth = scaledImgWidth * scaleToOutput;
      const drawHeight = scaledImgHeight * scaleToOutput;
      const drawX = (outputWidth / 2) + (imagePos.x * scaleToOutput) - (drawWidth / 2);
      const drawY = (outputHeight / 2) + (imagePos.y * scaleToOutput) - (drawHeight / 2);

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCroppedImage(dataUrl);
      toast({ title: "Success!", description: "Passport photo created successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to crop image.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }, [originalImage, selectedSize, imagePos, imageScale, toast]);

  const handleDownload = useCallback(() => {
    if (!croppedImage) return;
    const link = document.createElement("a");
    link.download = `passport-photo-${selectedSize.id}-${Date.now()}.jpg`;
    link.href = croppedImage;
    link.click();
    toast({ title: "Downloaded!", description: "Your passport photo has been saved." });
  }, [croppedImage, selectedSize, toast]);

  const aspectRatio = selectedSize.widthMM / selectedSize.heightMM;

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Select Passport Size
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {passportSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedSize.id === size.id
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:bg-primary/10"
              }`}
            >
              <p className="font-medium text-sm">{size.name}</p>
              <p className={`text-xs ${selectedSize.id === size.id ? "opacity-80" : "text-muted-foreground"}`}>
                {size.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      {!originalImage ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Upload your photo</p>
          <p className="text-sm text-muted-foreground mt-1">Face should be centered and clearly visible</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Crop Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Position Your Face</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Move className="w-4 h-4" />
                Drag to adjust
              </div>
            </div>
            
            <div 
              ref={containerRef}
              className="relative bg-secondary/30 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ height: 300 + 40, padding: 20 }}
            >
              {/* Crop Frame */}
              <div
                className="relative overflow-hidden rounded-lg border-2 border-primary cursor-move select-none"
                style={{
                  width: 300 * aspectRatio,
                  height: 300,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Image */}
                <div
                  className="absolute"
                  style={{
                    left: `calc(50% + ${imagePos.x}px)`,
                    top: `calc(50% + ${imagePos.y}px)`,
                    transform: `translate(-50%, -50%) scale(${imageScale})`,
                    transformOrigin: "center",
                  }}
                >
                  <img
                    src={originalImage}
                    alt="Preview"
                    className="max-w-none pointer-events-none"
                    draggable={false}
                  />
                </div>
                
                {/* Guide Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/30" />
                </div>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.05"
                value={imageScale}
                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12">{Math.round(imageScale * 100)}%</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <label className="flex-1">
                <Button variant="outline" className="w-full" asChild>
                  <span><Upload className="w-4 h-4 mr-2" />Change Photo</span>
                </Button>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <Button onClick={handleCrop} disabled={processing} className="flex-1 btn-primary">
                {processing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" />Crop Photo</>
                )}
              </Button>
            </div>
          </div>

          {/* Result Preview */}
          <div className="space-y-4">
            <h3 className="font-medium">Result Preview</h3>
            <div 
              className="bg-secondary/30 rounded-xl flex items-center justify-center"
              style={{ height: 300 + 40, padding: 20 }}
            >
              {croppedImage ? (
                <div className="text-center space-y-4">
                  <div
                    className="rounded-lg overflow-hidden border-2 border-border mx-auto"
                    style={{
                      width: 300 * aspectRatio,
                      height: 300,
                    }}
                  >
                    <img src={croppedImage} alt="Result" className="w-full h-full object-cover" />
                  </div>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />Download
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Cropped photo will appear here</p>
                  <p className="text-xs mt-1">{selectedSize.description}</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="glass rounded-xl p-4 text-sm">
              <p className="font-medium mb-2">Tips for passport photos:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>Face should occupy 70-80% of frame height</li>
                <li>Eyes should be roughly 1/3 from top</li>
                <li>Neutral expression with mouth closed</li>
                <li>White or light gray background preferred</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PassportCropper;
