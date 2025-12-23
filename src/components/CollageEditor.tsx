import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  RotateCcw,
  Grid3X3,
  Trash2,
  Plus,
  Move,
  Columns,
  Rows,
  LayoutGrid,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { canvasToBlob } from "@/lib/imageProcessing";

interface CollageEditorProps {
  onClose: () => void;
}

interface CollageImage {
  id: string;
  url: string;
  file: File;
}

type LayoutType = "grid-2x1" | "grid-1x2" | "grid-2x2" | "grid-3x1" | "grid-1x3" | "grid-3x3" | "grid-2x3" | "grid-3x2";

interface LayoutConfig {
  name: string;
  icon: any;
  rows: number;
  cols: number;
  slots: number;
}

const layouts: Record<LayoutType, LayoutConfig> = {
  "grid-2x1": { name: "2 Horizontal", icon: Columns, rows: 1, cols: 2, slots: 2 },
  "grid-1x2": { name: "2 Vertical", icon: Rows, rows: 2, cols: 1, slots: 2 },
  "grid-2x2": { name: "2×2 Grid", icon: Grid3X3, rows: 2, cols: 2, slots: 4 },
  "grid-3x1": { name: "3 Horizontal", icon: Columns, rows: 1, cols: 3, slots: 3 },
  "grid-1x3": { name: "3 Vertical", icon: Rows, rows: 3, cols: 1, slots: 3 },
  "grid-3x3": { name: "3×3 Grid", icon: LayoutGrid, rows: 3, cols: 3, slots: 9 },
  "grid-2x3": { name: "2×3 Grid", icon: LayoutGrid, rows: 3, cols: 2, slots: 6 },
  "grid-3x2": { name: "3×2 Grid", icon: LayoutGrid, rows: 2, cols: 3, slots: 6 },
};

const CollageEditor = ({ onClose }: CollageEditorProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<LayoutType>("grid-2x2");
  const [spacing, setSpacing] = useState(8);
  const [borderRadius, setBorderRadius] = useState(8);
  const [backgroundColor, setBackgroundColor] = useState("#1a1a2e");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const layoutConfig = layouts[layout];

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newImages: CollageImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newImages.push({
          id,
          url: URL.createObjectURL(file),
          file,
        });
      }
    });
    
    setImages((prev) => [...prev, ...newImages].slice(0, layoutConfig.slots));
    toast({ title: `${newImages.length} image(s) added` });
  }, [layoutConfig.slots, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  }, [handleImageUpload]);

  const handleSlotDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    const draggedId = e.dataTransfer.getData("imageId");
    if (draggedId) {
      // Reordering existing image
      const draggedIndex = images.findIndex((img) => img.id === draggedId);
      if (draggedIndex !== -1) {
        const newImages = [...images];
        const [removed] = newImages.splice(draggedIndex, 1);
        newImages.splice(slotIndex, 0, removed);
        setImages(newImages);
      }
    } else {
      // New image upload to specific slot
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        const file = files[0];
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newImage: CollageImage = {
          id,
          url: URL.createObjectURL(file),
          file,
        };
        
        const newImages = [...images];
        if (slotIndex < newImages.length) {
          newImages[slotIndex] = newImage;
        } else {
          newImages.push(newImage);
        }
        setImages(newImages.slice(0, layoutConfig.slots));
      }
    }
  };

  const handleImageDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast({ title: "Image removed" });
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setLayout("grid-2x2");
    setSpacing(8);
    setBorderRadius(8);
    toast({ title: "Collage reset" });
  };

  const handleDownload = async () => {
    if (images.length === 0) {
      toast({ title: "No images", description: "Add at least one image to create a collage.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      
      // Canvas dimensions
      const cellWidth = 400;
      const cellHeight = 400;
      const totalSpacing = spacing * (layoutConfig.cols + 1);
      const totalSpacingV = spacing * (layoutConfig.rows + 1);
      
      canvas.width = cellWidth * layoutConfig.cols + totalSpacing;
      canvas.height = cellHeight * layoutConfig.rows + totalSpacingV;
      
      // Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load all images
      const loadedImages = await Promise.all(
        images.map((img) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = img.url;
          });
        })
      );
      
      // Draw images in grid
      for (let i = 0; i < Math.min(loadedImages.length, layoutConfig.slots); i++) {
        const row = Math.floor(i / layoutConfig.cols);
        const col = i % layoutConfig.cols;
        
        const x = spacing + col * (cellWidth + spacing);
        const y = spacing + row * (cellHeight + spacing);
        
        const img = loadedImages[i];
        
        // Calculate crop to cover cell
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const cellAspect = cellWidth / cellHeight;
        
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        
        if (imgAspect > cellAspect) {
          sw = img.naturalHeight * cellAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / cellAspect;
          sy = (img.naturalHeight - sh) / 2;
        }
        
        // Draw with rounded corners using clipping
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, cellWidth, cellHeight, borderRadius);
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh, x, y, cellWidth, cellHeight);
        ctx.restore();
      }
      
      // Download
      const blob = await canvasToBlob(canvas, "image/png");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "picperfect-collage.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: "Collage downloaded!", description: "Your collage has been saved." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create collage.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < layoutConfig.slots; i++) {
      const image = images[i];
      slots.push(
        <div
          key={i}
          className={`relative aspect-square bg-secondary/50 rounded-lg overflow-hidden transition-all duration-200 ${
            dragOverIndex === i ? "ring-2 ring-primary scale-[1.02]" : ""
          } ${!image ? "border-2 border-dashed border-border hover:border-primary/50" : ""}`}
          style={{ borderRadius: borderRadius }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverIndex(i);
          }}
          onDragLeave={() => setDragOverIndex(null)}
          onDrop={(e) => handleSlotDrop(e, i)}
        >
          {image ? (
            <>
              <img
                src={image.url}
                alt={`Collage image ${i + 1}`}
                className="w-full h-full object-cover cursor-move"
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id)}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <button
                  onClick={() => removeImage(image.id)}
                  className="p-2 bg-destructive rounded-lg text-destructive-foreground hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 p-1 bg-black/50 rounded text-xs text-white">
                <Move className="w-3 h-3" />
              </div>
            </>
          ) : (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-xs">Add Image</span>
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">Collage Maker</h3>
          </div>
          <div className="flex items-center gap-3">
            {images.length > 0 && (
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
                  {isProcessing ? "Creating..." : "Download"}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Preview Area */}
            <div className="lg:col-span-3">
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
                    gap: spacing,
                  }}
                >
                  {renderSlots()}
                </div>
              </div>
              
              {/* Upload button */}
              <div className="mt-4 flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 glass rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Add Images ({images.length}/{layoutConfig.slots})
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Layout Selection */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Layout
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(layouts) as LayoutType[]).map((key) => {
                    const config = layouts[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setLayout(key)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all ${
                          layout === key
                            ? "bg-primary text-primary-foreground"
                            : "glass hover:bg-primary/10"
                        }`}
                      >
                        <config.icon className="w-4 h-4" />
                        {config.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Spacing</label>
                  <span className="text-xs text-muted-foreground">{spacing}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={spacing}
                  onChange={(e) => setSpacing(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Corner Radius</label>
                  <span className="text-xs text-muted-foreground">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Background</label>
                <div className="flex gap-2">
                  {["#1a1a2e", "#0f0f23", "#2d1b69", "#1e3a5f", "#2d3436", "#000000", "#ffffff"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        backgroundColor === color ? "border-primary scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 glass rounded-xl">
                <h5 className="text-sm font-medium mb-2">How to use</h5>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Click slots or drag images</li>
                  <li>• Drag images to reorder</li>
                  <li>• Choose layout & spacing</li>
                  <li>• Download your collage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollageEditor;
