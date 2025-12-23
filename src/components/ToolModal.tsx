import { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Upload,
  LayoutGrid,
  SlidersHorizontal,
  Download,
  Maximize2,
  Crop,
  FileType,
  MessageSquare,
  RotateCcw,
  Lock,
  Unlock,
  Check,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  resizeImage,
  convertImageFormat,
  loadImageFromUrl,
  canvasToBlob,
} from "@/lib/imageProcessing";

interface ToolModalProps {
  tool: string;
  onClose: () => void;
}

const toolConfig: Record<string, { title: string; icon: any; color: string }> = {
  collage: { title: "Create Collage", icon: LayoutGrid, color: "from-violet-500 to-purple-600" },
  save: { title: "Save Image", icon: Download, color: "from-emerald-500 to-teal-600" },
  resize: { title: "Resize Image", icon: Maximize2, color: "from-blue-500 to-cyan-600" },
  crop: { title: "Crop Image", icon: Crop, color: "from-orange-500 to-amber-600" },
  converter: { title: "Convert Format", icon: FileType, color: "from-indigo-500 to-blue-600" },
  feedback: { title: "Share Feedback", icon: MessageSquare, color: "from-primary to-accent" },
};

const ToolModal = ({ tool, onClose }: ToolModalProps) => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Resize state
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  
  // Converter state
  const [selectedFormat, setSelectedFormat] = useState<"PNG" | "JPG" | "WebP">("PNG");
  const [quality, setQuality] = useState(92);
  
  // Crop state
  const [selectedRatio, setSelectedRatio] = useState<string>("Free");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = toolConfig[tool] || { 
    title: "Tool", 
    icon: MessageSquare, 
    color: "from-primary to-accent" 
  };

  // If tool doesn't have a config and isn't feedback, close the modal
  if (!toolConfig[tool] && tool !== "feedback") {
    return null;
  }
  // Load image element when URL changes
  useEffect(() => {
    if (uploadedImage) {
      loadImageFromUrl(uploadedImage).then((img) => {
        setImageElement(img);
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      });
    }
  }, [uploadedImage]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({ title: "Image uploaded!", description: "Your image is ready for editing." });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({ title: "Image uploaded!", description: "Your image is ready for editing." });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim() && feedbackName.trim() && feedbackEmail.trim() && feedbackRating > 0) {
      toast({ title: "Thank you!", description: "Your feedback has been submitted successfully." });
      setFeedbackText("");
      setFeedbackName("");
      setFeedbackEmail("");
      setFeedbackRating(0);
      onClose();
    } else {
      toast({ title: "Please fill all fields", description: "Name, email, rating, and feedback are required.", variant: "destructive" });
    }
  };

  const handleWidthChange = (value: number) => {
    setResizeWidth(value);
    if (lockAspect) {
      setResizeHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setResizeHeight(value);
    if (lockAspect) {
      setResizeWidth(Math.round(value * aspectRatio));
    }
  };

  const handleResize = async () => {
    if (!imageElement) return;
    
    setIsProcessing(true);
    try {
      const resizedCanvas = resizeImage(imageElement, resizeWidth, resizeHeight, false);
      const blob = await canvasToBlob(resizedCanvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resized-${resizeWidth}x${resizeHeight}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Image resized!", description: `New size: ${resizeWidth}x${resizeHeight}px` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to resize image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (!imageElement) return;
    
    setIsProcessing(true);
    try {
      const formatMap: Record<string, "image/png" | "image/jpeg" | "image/webp"> = {
        PNG: "image/png",
        JPG: "image/jpeg",
        WebP: "image/webp",
      };
      
      const blob = await convertImageFormat(imageElement, formatMap[selectedFormat], quality / 100);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted.${selectedFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Image converted!", description: `Format: ${selectedFormat}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to convert image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!imageElement) return;
    
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);
      
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "picperfect-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Image saved!", description: "Your image has been downloaded." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (tool === "feedback") {
      return (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Help us improve PicPerfect by sharing your thoughts, suggestions, or reporting issues.
          </p>
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={feedbackName}
              onChange={(e) => setFeedbackName(e.target.value)}
              placeholder="Your name"
              className="input-field w-full"
            />
          </div>
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={feedbackEmail}
              onChange={(e) => setFeedbackEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field w-full"
            />
          </div>
          
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`p-2 rounded-lg transition-all ${
                    star <= feedbackRating 
                      ? "text-yellow-500 scale-110" 
                      : "text-muted-foreground hover:text-yellow-400"
                  }`}
                >
                  <Star className={`w-6 h-6 ${star <= feedbackRating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Feedback</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think..."
              className="input-field min-h-[120px] resize-none w-full"
            />
          </div>
          
          <button onClick={handleFeedbackSubmit} className="btn-primary w-full">
            Submit Feedback
          </button>
        </div>
      );
    }

    if (!uploadedImage) {
      return (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id={`image-upload-${tool}`}
          />
          <label htmlFor={`image-upload-${tool}`} className="cursor-pointer">
            <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">Drop your image here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-4">Supports: JPG, PNG, WebP, GIF</p>
          </label>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Image Preview */}
        <div className="relative rounded-xl overflow-hidden glass">
          <img src={uploadedImage} alt="Uploaded" className="w-full max-h-[300px] object-contain" />
          <button
            onClick={() => {
              setUploadedImage(null);
              setImageElement(null);
            }}
            className="absolute top-4 right-4 p-2 rounded-lg glass hover:bg-destructive/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {imageElement && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-xs">
              {imageElement.naturalWidth} × {imageElement.naturalHeight}px
            </div>
          )}
        </div>

        {/* Resize Controls */}
        {tool === "resize" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-primary" />
              New Dimensions
            </h4>
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Width (px)</label>
                <input
                  type="number"
                  value={resizeWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`p-3 rounded-xl glass mb-0.5 transition-colors ${lockAspect ? "text-primary" : "text-muted-foreground"}`}
              >
                {lockAspect ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </button>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Height (px)</label>
                <input
                  type="number"
                  value={resizeHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "HD", w: 1280, h: 720 },
                { label: "Full HD", w: 1920, h: 1080 },
                { label: "4K", w: 3840, h: 2160 },
                { label: "Instagram", w: 1080, h: 1080 },
                { label: "Twitter", w: 1200, h: 675 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setResizeWidth(preset.w);
                    setResizeHeight(preset.h);
                  }}
                  className="px-3 py-1.5 rounded-lg glass text-xs hover:bg-primary/10 transition-colors"
                >
                  {preset.label} ({preset.w}×{preset.h})
                </button>
              ))}
            </div>
            <button onClick={handleResize} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? "Processing..." : "Resize & Download"}
            </button>
          </div>
        )}

        {/* Converter Controls */}
        {tool === "converter" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileType className="w-4 h-4 text-primary" />
              Output Format
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {(["PNG", "JPG", "WebP"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-xl glass transition-colors flex flex-col items-center gap-1 ${
                    selectedFormat === format ? "bg-primary/20 border-primary text-primary" : "hover:bg-primary/10"
                  }`}
                >
                  <span className="font-medium">{format}</span>
                  <span className="text-xs text-muted-foreground">
                    {format === "PNG" && "Lossless"}
                    {format === "JPG" && "Compressed"}
                    {format === "WebP" && "Modern"}
                  </span>
                  {selectedFormat === format && <Check className="w-4 h-4 mt-1" />}
                </button>
              ))}
            </div>
            {selectedFormat !== "PNG" && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
            <button onClick={handleConvert} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? "Converting..." : `Convert to ${selectedFormat}`}
            </button>
          </div>
        )}

        {/* Crop Controls */}
        {tool === "crop" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Crop className="w-4 h-4 text-primary" />
              Aspect Ratio
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {["1:1", "16:9", "4:3", "Free"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`p-3 rounded-xl glass transition-colors text-sm font-medium ${
                    selectedRatio === ratio ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Click and drag on the image to select the crop area. (Coming soon)
            </p>
          </div>
        )}

        {/* Collage Controls */}
        {tool === "collage" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              Layout
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {["2×2", "3×3", "2×3", "Custom"].map((layout) => (
                <button
                  key={layout}
                  className="p-3 rounded-xl glass hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  {layout}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload multiple images to create a collage. (Coming soon)
            </p>
          </div>
        )}

        {/* Save Controls */}
        {tool === "save" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Download Options
            </h4>
            <button onClick={handleSave} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? "Preparing..." : "Download Image"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <config.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">{config.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
