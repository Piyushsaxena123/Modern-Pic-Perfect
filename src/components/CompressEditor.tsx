import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  Minimize2,
  FileIcon,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
  Image,
  FileText,
  File,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompressEditorProps {
  onClose: () => void;
}

interface ProcessedFile {
  id: string;
  file: File;
  url: string;
  originalSize: number;
  compressedSize: number | null;
  compressedBlob: Blob | null;
  type: "image" | "pdf" | "other";
}

const CompressEditor = ({ onClose }: CompressEditorProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [quality, setQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"jpeg" | "webp" | "png">("jpeg");
  
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

  const getFileType = (file: File): "image" | "pdf" | "other" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    return "other";
  };

  const getFileIcon = (type: "image" | "pdf" | "other") => {
    switch (type) {
      case "image": return Image;
      case "pdf": return FileText;
      default: return File;
    }
  };

  const compressImage = async (file: File, quality: number, format: "jpeg" | "webp" | "png"): Promise<Blob> => {
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
        
        const mimeType = format === "png" ? "image/png" : `image/${format}`;
        const q = format === "png" ? undefined : quality / 100;
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to compress image"));
          },
          mimeType,
          q
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles: ProcessedFile[] = Array.from(fileList).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      originalSize: file.size,
      compressedSize: null,
      compressedBlob: null,
      type: getFileType(file),
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    const imageCount = newFiles.filter(f => f.type === "image").length;
    const otherCount = newFiles.length - imageCount;
    
    let msg = "";
    if (imageCount > 0) msg += `${imageCount} image(s)`;
    if (otherCount > 0) msg += (msg ? " and " : "") + `${otherCount} other file(s)`;
    
    toast({ title: `${msg} added` });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const compressAll = async () => {
    setIsProcessing(true);
    
    try {
      const updatedFiles = await Promise.all(
        files.map(async (f) => {
          if (f.type === "image") {
            try {
              const blob = await compressImage(f.file, quality, format);
              return { ...f, compressedSize: blob.size, compressedBlob: blob };
            } catch {
              return f;
            }
          }
          // For non-image files, just keep original (compression not supported client-side)
          return { ...f, compressedSize: f.originalSize, compressedBlob: f.file };
        })
      );
      
      setFiles(updatedFiles);
      toast({ title: "Compression complete!", description: "Files are ready to download." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to compress some files.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    for (const f of files) {
      const blob = f.compressedBlob || f.file;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      if (f.type === "image" && f.compressedBlob) {
        const baseName = f.file.name.replace(/\.[^/.]+$/, "");
        const ext = format === "jpeg" ? "jpg" : format;
        link.download = `${baseName}-compressed.${ext}`;
      } else {
        link.download = f.file.name;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    toast({ title: "Files downloaded!", description: `${files.length} file(s) saved.` });
  };

  const totalOriginal = files.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressed = files.reduce((sum, f) => sum + (f.compressedSize || f.originalSize), 0);
  const hasCompressed = files.some(f => f.compressedBlob !== null);

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
              <h3 className="text-xl font-display font-semibold">File Compressor</h3>
              <p className="text-xs text-muted-foreground">Compress images and files</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {files.length > 0 && hasCompressed && (
              <button
                onClick={handleDownloadAll}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
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
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Drop files to compress</p>
              <p className="text-sm text-muted-foreground">Images (JPG, PNG, WebP) • Documents (PDF, Word, Excel)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Files list */}
            <div className="lg:col-span-2 space-y-4">
              {files.length > 0 ? (
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

                  {/* File cards */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {files.map((f) => {
                      const IconComponent = getFileIcon(f.type);
                      return (
                        <div key={f.id} className="flex items-center gap-4 p-3 glass rounded-xl group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                            {f.type === "image" && f.url ? (
                              <img src={f.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <IconComponent className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{f.file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(f.originalSize)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary font-medium">
                                {f.compressedSize ? formatFileSize(f.compressedSize) : "..."}
                              </span>
                              {f.compressedSize && f.compressedSize < f.originalSize && (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                                  -{calculateSavings(f.originalSize, f.compressedSize)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">{f.type}</p>
                          </div>
                          <button
                            onClick={() => removeFile(f.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files added yet</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Quality slider (for images) */}
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Image Quality
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
                <label className="text-sm font-medium mb-3 block">Image Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["jpeg", "webp", "png"] as const).map((fmt) => (
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
                      <span className="text-[10px] opacity-80">
                        {fmt === "jpeg" ? "Universal" : fmt === "webp" ? "Best" : "Lossless"}
                      </span>
                      {format === fmt && <Check className="w-4 h-4 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compress Button */}
              <button
                onClick={compressAll}
                disabled={files.length === 0 || isProcessing}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Compressing...</>
                ) : (
                  <><Minimize2 className="w-5 h-5" />Compress Files</>
                )}
              </button>

              {/* Tips */}
              <div className="p-4 glass rounded-xl">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Compression Tips
                </h5>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• 70-80% is ideal for photos</li>
                  <li>• WebP offers 25-35% better compression</li>
                  <li>• PNG is lossless (no quality loss)</li>
                  <li>• Non-image files keep original size</li>
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
