import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  RotateCcw,
  Sun,
  Contrast,
  Droplet,
  Sparkles,
  Eye,
  Palette,
  CloudFog,
  RotateCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  FilterSettings,
  defaultFilters,
  applyFiltersToCanvas,
  downloadCanvas,
  loadImageFromUrl,
} from "@/lib/imageProcessing";

interface FilterEditorProps {
  onClose: () => void;
}

interface FilterControl {
  key: keyof FilterSettings;
  label: string;
  icon: any;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const filterControls: FilterControl[] = [
  { key: "brightness", label: "Brightness", icon: Sun, min: 0, max: 200, step: 1, unit: "%" },
  { key: "contrast", label: "Contrast", icon: Contrast, min: 0, max: 200, step: 1, unit: "%" },
  { key: "saturation", label: "Saturation", icon: Droplet, min: 0, max: 200, step: 1, unit: "%" },
  { key: "blur", label: "Blur", icon: CloudFog, min: 0, max: 20, step: 0.5, unit: "px" },
  { key: "grayscale", label: "Grayscale", icon: Eye, min: 0, max: 100, step: 1, unit: "%" },
  { key: "sepia", label: "Sepia", icon: Palette, min: 0, max: 100, step: 1, unit: "%" },
  { key: "hueRotate", label: "Hue Rotate", icon: RotateCw, min: 0, max: 360, step: 1, unit: "°" },
  { key: "invert", label: "Invert", icon: Sparkles, min: 0, max: 100, step: 1, unit: "%" },
];

const presets = [
  { name: "Original", filters: defaultFilters },
  { name: "Vivid", filters: { ...defaultFilters, brightness: 110, contrast: 120, saturation: 130 } },
  { name: "Warm", filters: { ...defaultFilters, sepia: 30, brightness: 105 } },
  { name: "Cool", filters: { ...defaultFilters, hueRotate: 180, saturation: 80 } },
  { name: "B&W", filters: { ...defaultFilters, grayscale: 100, contrast: 120 } },
  { name: "Vintage", filters: { ...defaultFilters, sepia: 50, contrast: 90, brightness: 95 } },
  { name: "Dramatic", filters: { ...defaultFilters, contrast: 150, brightness: 90, saturation: 120 } },
  { name: "Fade", filters: { ...defaultFilters, contrast: 80, saturation: 70, brightness: 110 } },
];

const FilterEditor = ({ onClose }: FilterEditorProps) => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when URL changes
  useEffect(() => {
    if (uploadedImage) {
      loadImageFromUrl(uploadedImage).then(setImageElement).catch(console.error);
    }
  }, [uploadedImage]);

  // Apply filters to canvas when image or filters change
  useEffect(() => {
    if (imageElement && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions
      const maxWidth = 600;
      const maxHeight = 400;
      const scale = Math.min(maxWidth / imageElement.naturalWidth, maxHeight / imageElement.naturalHeight, 1);
      
      canvasRef.current.width = imageElement.naturalWidth * scale;
      canvasRef.current.height = imageElement.naturalHeight * scale;

      // Build filter string
      const filterString = [
        `brightness(${filters.brightness}%)`,
        `contrast(${filters.contrast}%)`,
        `saturate(${filters.saturation}%)`,
        `blur(${filters.blur}px)`,
        `grayscale(${filters.grayscale}%)`,
        `sepia(${filters.sepia}%)`,
        `hue-rotate(${filters.hueRotate}deg)`,
        `invert(${filters.invert}%)`,
      ].join(" ");

      ctx.filter = filterString;
      ctx.drawImage(imageElement, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [imageElement, filters]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setFilters(defaultFilters);
        toast({ title: "Image uploaded!", description: "Start adjusting filters below." });
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
        setFilters(defaultFilters);
        toast({ title: "Image uploaded!", description: "Start adjusting filters below." });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleFilterChange = (key: keyof FilterSettings, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    toast({ title: "Filters reset", description: "All filters have been reset to default." });
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setFilters(preset.filters);
    toast({ title: `${preset.name} preset applied` });
  };

  const handleDownload = async () => {
    if (!imageElement) return;
    
    setIsProcessing(true);
    try {
      const processedCanvas = applyFiltersToCanvas(imageElement, filters);
      await downloadCanvas(processedCanvas, "picperfect-edited.png");
      toast({ title: "Image downloaded!", description: "Your edited image has been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">Filter Editor</h3>
          </div>
          <div className="flex items-center gap-3">
            {uploadedImage && (
              <>
                <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button 
                  onClick={handleDownload} 
                  disabled={isProcessing}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Download"}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!uploadedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-2xl p-16 text-center hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="filter-image-upload" />
              <label htmlFor="filter-image-upload" className="cursor-pointer">
                <div className="w-20 h-20 rounded-2xl glass mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-medium mb-2">Drop your image here</p>
                <p className="text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-4">Supports: JPG, PNG, WebP, GIF</p>
              </label>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Preview */}
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden glass p-2">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                {/* Presets */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Quick Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset)}
                        className="px-4 py-2 rounded-lg glass text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Adjustments
                </h4>
                
                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
                  {filterControls.map((control) => (
                    <div key={control.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">
                          <control.icon className="w-4 h-4 text-primary" />
                          {control.label}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {filters[control.key]}{control.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={filters[control.key]}
                        onChange={(e) => handleFilterChange(control.key, parseFloat(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  ))}
                </div>

                {/* Upload new image */}
                <div className="pt-4 border-t border-border">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="new-image-upload" />
                  <label
                    htmlFor="new-image-upload"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl glass text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Image
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterEditor;
