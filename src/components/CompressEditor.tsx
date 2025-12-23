import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  Minimize2,
  Image,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompressEditorProps {
  onClose: () => void;
}

interface ImageFile {
  id: string;
  file: File;
  url: string;
  originalSize: number;
  compressedSize: number | null;
  compressedBlob: Blob | null;
}

const CompressEditor = ({ onClose }: CompressEditorProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"jpeg" | "webp">("jpeg");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateSavings = (original: number, compressed: number): string => {
    const savings = ((original - compressed) / original) * 100;
    return savings.toFixed(1);
  };

  const compressImage = async (file: File, quality: number, format: "jpeg" | "webp"): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // White background for JPEG
        if (format === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to compress image"));
          },
          `image/${format}`,
          quality / 100
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageFile[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
        originalSize: file.size,
        compressedSize: null,
        compressedBlob: null,
      }));
    
    setImages(prev => [...prev, ...newImages]);
    toast({ title: `${newImages.length} image(s) added` });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Re-compress when quality or format changes
  useEffect(() => {
    const compressAll = async () => {
      if (images.length === 0) return;
      
      const updatedImages = await Promise.all(
        images.map(async (img) => {
          try {
            const blob = await compressImage(img.file, quality, format);
            return { ...img, compressedSize: blob.size, compressedBlob: blob };
          } catch {
            return img;
          }
        })
      );
      
      setImages(updatedImages);
    };
    
    compressAll();
  }, [quality, format, images.length]);

  const handleDownloadAll = async () => {
    setIsProcessing(true);
    try {
      for (const img of images) {
        if (img.compressedBlob) {
          const url = URL.createObjectURL(img.compressedBlob);
          const link = document.createElement("a");
          link.href = url;
          const baseName = img.file.name.replace(/\.[^/.]+$/, "");
          link.download = `${baseName}-compressed.${format === "jpeg" ? "jpg" : "webp"}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
      toast({ title: "Images downloaded!", description: `${images.length} compressed image(s) saved.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download images.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressed = images.reduce((sum, img) => sum + (img.compressedSize || img.originalSize), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Minimize2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold">Image Compressor</h3>
              <p className="text-xs text-muted-foreground">Reduce file size while maintaining quality</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {images.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={isProcessing}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isProcessing ? "Saving..." : "Download All"}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Drop images to compress</p>
              <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Images list */}
            <div className="lg:col-span-2 space-y-4">
              {images.length > 0 ? (
                <>
                  {/* Summary */}
                  <div className="p-4 glass rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Original</p>
                        <p className="font-semibold text-lg">{formatFileSize(totalOriginal)}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Compressed</p>
                        <p className="font-semibold text-lg text-primary">{formatFileSize(totalCompressed)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="font-bold text-2xl text-accent">
                        {calculateSavings(totalOriginal, totalCompressed)}%
                      </p>
                    </div>
                  </div>

                  {/* Image cards */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {images.map((img) => (
                      <div key={img.id} className="flex items-center gap-4 p-3 glass rounded-xl group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{img.file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(img.originalSize)}
                            </span>
                            <ArrowRight className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary font-medium">
                              {img.compressedSize ? formatFileSize(img.compressedSize) : "..."}
                            </span>
                            {img.compressedSize && (
                              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                                -{calculateSavings(img.originalSize, img.compressedSize)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No images added yet</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Quality slider */}
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Quality
                  </label>
                  <span className="text-lg font-bold text-primary">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {/* Format selection */}
              <div className="p-4 glass rounded-xl">
                <label className="text-sm font-medium mb-3 block">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["jpeg", "webp"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                        format === fmt
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:bg-primary/10"
                      }`}
                    >
                      <span className="font-medium text-sm">{fmt.toUpperCase()}</span>
                      <span className="text-xs opacity-80">
                        {fmt === "jpeg" ? "Universal" : "Best compression"}
                      </span>
                      {format === fmt && <Check className="w-4 h-4 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 glass rounded-xl">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Compression Tips
                </h5>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• 70-80% is ideal for photos</li>
                  <li>• WebP offers 25-35% better compression</li>
                  <li>• Lower quality for web, higher for print</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressEditor;
