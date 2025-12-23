import { useState, useCallback } from "react";
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
  Image,
  Sun,
  Contrast,
  Droplet,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolModalProps {
  tool: string;
  onClose: () => void;
}

const toolConfig: Record<string, { title: string; icon: any; color: string }> = {
  collage: { title: "Create Collage", icon: LayoutGrid, color: "from-violet-500 to-purple-600" },
  filter: { title: "Apply Filters", icon: SlidersHorizontal, color: "from-pink-500 to-rose-600" },
  save: { title: "Save Image", icon: Download, color: "from-emerald-500 to-teal-600" },
  resize: { title: "Resize Image", icon: Maximize2, color: "from-blue-500 to-cyan-600" },
  crop: { title: "Crop Image", icon: Crop, color: "from-orange-500 to-amber-600" },
  converter: { title: "Convert Format", icon: FileType, color: "from-indigo-500 to-blue-600" },
  feedback: { title: "Share Feedback", icon: MessageSquare, color: "from-primary to-accent" },
};

const ToolModal = ({ tool, onClose }: ToolModalProps) => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const config = toolConfig[tool];

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
    if (feedbackText.trim()) {
      toast({ title: "Thank you!", description: "Your feedback has been submitted." });
      setFeedbackText("");
      onClose();
    }
  };

  const renderContent = () => {
    if (tool === "feedback") {
      return (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Help us improve PicPerfect by sharing your thoughts, suggestions, or reporting issues.
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            className="input-field min-h-[150px] resize-none"
          />
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
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
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
          <img src={uploadedImage} alt="Uploaded" className="w-full max-h-[400px] object-contain" />
          <button
            onClick={() => setUploadedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-lg glass hover:bg-destructive/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tool-specific controls */}
        {tool === "filter" && (
          <div className="space-y-4">
            <h4 className="font-medium">Quick Filters</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: "Brightness", icon: Sun },
                { name: "Contrast", icon: Contrast },
                { name: "Saturation", icon: Droplet },
                { name: "Auto", icon: Sparkles },
              ].map((filter) => (
                <button
                  key={filter.name}
                  className="p-4 rounded-xl glass hover:bg-primary/10 transition-colors flex flex-col items-center gap-2"
                >
                  <filter.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs">{filter.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tool === "resize" && (
          <div className="space-y-4">
            <h4 className="font-medium">Dimensions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Width (px)</label>
                <input type="number" placeholder="1920" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Height (px)</label>
                <input type="number" placeholder="1080" className="input-field" />
              </div>
            </div>
          </div>
        )}

        {tool === "converter" && (
          <div className="space-y-4">
            <h4 className="font-medium">Output Format</h4>
            <div className="grid grid-cols-4 gap-3">
              {["PNG", "JPG", "WebP", "GIF"].map((format) => (
                <button
                  key={format}
                  className="p-3 rounded-xl glass hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        )}

        {tool === "crop" && (
          <div className="space-y-4">
            <h4 className="font-medium">Aspect Ratio</h4>
            <div className="grid grid-cols-4 gap-3">
              {["1:1", "16:9", "4:3", "Free"].map((ratio) => (
                <button
                  key={ratio}
                  className="p-3 rounded-xl glass hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        )}

        {tool === "collage" && (
          <div className="space-y-4">
            <h4 className="font-medium">Layout</h4>
            <div className="grid grid-cols-4 gap-3">
              {["2x2", "3x3", "2x3", "Custom"].map((layout) => (
                <button
                  key={layout}
                  className="p-3 rounded-xl glass hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  {layout}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="btn-secondary flex-1">Preview</button>
          <button className="btn-primary flex-1">
            {tool === "save" ? "Download" : "Apply"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <config.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
