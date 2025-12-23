import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  Save,
  Image,
  FileText,
  Check,
  Loader2,
  FolderDown,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface SaveEditorProps {
  onClose: () => void;
}

type SaveFormat = "original" | "png" | "jpg" | "webp" | "pdf";

interface FormatOption {
  id: SaveFormat;
  label: string;
  description: string;
  extension: string;
}

const formatOptions: FormatOption[] = [
  { id: "original", label: "Original", description: "Keep original format", extension: "" },
  { id: "png", label: "PNG", description: "Lossless, transparent support", extension: "png" },
  { id: "jpg", label: "JPG", description: "Compressed, smaller size", extension: "jpg" },
  { id: "webp", label: "WebP", description: "Modern, best compression", extension: "webp" },
  { id: "pdf", label: "PDF", description: "Document format", extension: "pdf" },
];

const SaveEditor = ({ onClose }: SaveEditorProps) => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<SaveFormat>("original");
  const [quality, setQuality] = useState(92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareSection, setShowShareSection] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    setUploadedFiles((prev) => [...prev, ...imageFiles]);
    toast({ title: `${imageFiles.length} image(s) added` });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const loadImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertToFormat = async (file: File, format: SaveFormat): Promise<{ blob: Blob; ext: string }> => {
    if (format === "original") {
      const ext = file.name.split(".").pop() || "png";
      return { blob: file, ext };
    }

    const dataUrl = await loadImageAsDataUrl(file);
    const img = new window.Image();
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    if (format === "pdf") {
      const pdf = new jsPDF({
        orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait",
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const pageAspect = pageWidth / pageHeight;
      
      let imgWidth, imgHeight;
      if (imgAspect > pageAspect) {
        imgWidth = pageWidth - 20;
        imgHeight = imgWidth / imgAspect;
      } else {
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * imgAspect;
      }
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      const imgFormat = file.type === "image/png" ? "PNG" : "JPEG";
      pdf.addImage(dataUrl, imgFormat, x, y, imgWidth, imgHeight);
      
      return { blob: pdf.output("blob"), ext: "pdf" };
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) throw new Error("Could not get canvas context");
    
    if (format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0);
    
    const mimeType = {
      png: "image/png",
      jpg: "image/jpeg",
      webp: "image/webp",
    }[format];
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("Failed to create blob")),
        mimeType,
        quality / 100
      );
    });
    
    return { blob, ext: format };
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      for (const file of uploadedFiles) {
        const { blob, ext } = await convertToFormat(file, selectedFormat);
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const newName = selectedFormat === "original" 
          ? file.name 
          : `${baseName}.${ext}`;
        downloadBlob(blob, newName);
      }
      
      setShowShareSection(true);
      toast({ 
        title: "Files saved!", 
        description: `${uploadedFiles.length} file(s) downloaded. Share them on social media!` 
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = async () => {
    if (uploadedFiles.length === 0) return;
    await handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">Save Images</h3>
          </div>
          <div className="flex items-center gap-3">
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleSaveAll}
                disabled={isProcessing}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderDown className="w-4 h-4" />
                )}
                {isProcessing ? "Saving..." : `Save All (${uploadedFiles.length})`}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* File upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Drop images here to save</p>
              <p className="text-sm text-muted-foreground">or click to browse - supports multiple files</p>
            </div>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Images to save ({uploadedFiles.length})
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 glass rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Output Format
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-3 rounded-xl transition-all text-center ${
                    selectedFormat === format.id
                      ? "bg-primary text-primary-foreground"
                      : "glass hover:bg-primary/10"
                  }`}
                >
                  <span className="font-medium text-sm block">{format.label}</span>
                  <span className="text-xs opacity-80 block mt-1">{format.description}</span>
                  {selectedFormat === format.id && <Check className="w-4 h-4 mx-auto mt-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {selectedFormat !== "original" && selectedFormat !== "png" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-xs text-muted-foreground">{quality}%</span>
              </div>
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

          {/* Save button (mobile) */}
          {uploadedFiles.length > 0 && (
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="btn-primary w-full flex items-center justify-center gap-2 lg:hidden"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Save All Images
                </>
              )}
            </button>
          )}

          {/* Share Section */}
          {showShareSection && (
            <div className="p-6 glass rounded-xl mt-6 animate-fade-in">
              <h5 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                Share Your Images
              </h5>
              <p className="text-xs text-muted-foreground mb-4">
                Your images have been downloaded. Click below to share them on social media:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://twitter.com/intent/tweet?text=Check%20out%20my%20edited%20image%20created%20with%20PicPerfect!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
                <a
                  href="https://www.linkedin.com/sharing/share-offsite/?url=https://picperfect.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
                <a
                  href="https://www.facebook.com/sharer/sharer.php?quote=Check%20out%20my%20edited%20image%20created%20with%20PicPerfect!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                After clicking, attach your downloaded image to complete the post.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 glass rounded-xl mt-6">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Quick Tips
            </h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Use PNG for images with transparency</li>
              <li>• Use JPG for photos (smaller file size)</li>
              <li>• Use WebP for best compression & quality</li>
              <li>• Use PDF for documents & printing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveEditor;
