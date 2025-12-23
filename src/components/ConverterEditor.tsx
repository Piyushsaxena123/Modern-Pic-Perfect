import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  FileType,
  Image,
  FileText,
  Presentation,
  ArrowRight,
  Check,
  Loader2,
  File,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ConverterEditorProps {
  onClose: () => void;
}

type ConversionCategory = "image" | "document" | "presentation";

interface ConversionType {
  id: string;
  from: string;
  to: string;
  fromIcon: any;
  toIcon: any;
  category: ConversionCategory;
  accept: string;
  description: string;
}

const conversionTypes: ConversionType[] = [
  // Image conversions
  { id: "jpg-to-png", from: "JPG", to: "PNG", fromIcon: Image, toIcon: Image, category: "image", accept: "image/jpeg", description: "Convert JPEG to PNG format" },
  { id: "png-to-jpg", from: "PNG", to: "JPG", fromIcon: Image, toIcon: Image, category: "image", accept: "image/png", description: "Convert PNG to JPEG format" },
  { id: "webp-to-png", from: "WebP", to: "PNG", fromIcon: Image, toIcon: Image, category: "image", accept: "image/webp", description: "Convert WebP to PNG format" },
  { id: "webp-to-jpg", from: "WebP", to: "JPG", fromIcon: Image, toIcon: Image, category: "image", accept: "image/webp", description: "Convert WebP to JPEG format" },
  { id: "png-to-webp", from: "PNG", to: "WebP", fromIcon: Image, toIcon: Image, category: "image", accept: "image/png", description: "Convert PNG to WebP format" },
  { id: "jpg-to-webp", from: "JPG", to: "WebP", fromIcon: Image, toIcon: Image, category: "image", accept: "image/jpeg", description: "Convert JPEG to WebP format" },
  
  // Image to PDF
  { id: "jpg-to-pdf", from: "JPG", to: "PDF", fromIcon: Image, toIcon: FileText, category: "document", accept: "image/jpeg", description: "Convert JPEG image to PDF" },
  { id: "png-to-pdf", from: "PNG", to: "PDF", fromIcon: Image, toIcon: FileText, category: "document", accept: "image/png", description: "Convert PNG image to PDF" },
  { id: "images-to-pdf", from: "Images", to: "PDF", fromIcon: Image, toIcon: FileText, category: "document", accept: "image/*", description: "Combine multiple images into PDF" },
  
  // PDF to Image
  { id: "pdf-to-jpg", from: "PDF", to: "JPG", fromIcon: FileText, toIcon: Image, category: "document", accept: "application/pdf", description: "Convert PDF pages to JPEG images" },
  { id: "pdf-to-png", from: "PDF", to: "PNG", fromIcon: FileText, toIcon: Image, category: "document", accept: "application/pdf", description: "Convert PDF pages to PNG images" },
  
  // Document conversions (simulated/info)
  { id: "word-to-pdf", from: "Word", to: "PDF", fromIcon: FileText, toIcon: FileText, category: "document", accept: ".doc,.docx", description: "Convert Word document to PDF" },
  { id: "pdf-to-word", from: "PDF", to: "Word", fromIcon: FileText, toIcon: FileText, category: "document", accept: "application/pdf", description: "Convert PDF to Word document" },
  
  // Presentation conversions
  { id: "ppt-to-pdf", from: "PPT", to: "PDF", fromIcon: Presentation, toIcon: FileText, category: "presentation", accept: ".ppt,.pptx", description: "Convert PowerPoint to PDF" },
  { id: "pdf-to-ppt", from: "PDF", to: "PPT", fromIcon: FileText, toIcon: Presentation, category: "presentation", accept: "application/pdf", description: "Convert PDF to PowerPoint" },
  { id: "images-to-ppt", from: "Images", to: "PPT", fromIcon: Image, toIcon: Presentation, category: "presentation", accept: "image/*", description: "Create PowerPoint from images" },
];

const ConverterEditor = ({ onClose }: ConverterEditorProps) => {
  const { toast } = useToast();
  const [selectedConversion, setSelectedConversion] = useState<ConversionType | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(92);
  const [activeCategory, setActiveCategory] = useState<ConversionCategory>("image");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    if (selectedConversion?.id === "images-to-pdf" || selectedConversion?.id === "images-to-ppt") {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } else {
      setUploadedFiles([newFiles[0]]);
    }
    
    toast({ title: `${newFiles.length} file(s) added` });
  }, [selectedConversion, toast]);

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

  const convertImageFormat = async (file: File, toFormat: string): Promise<Blob> => {
    const dataUrl = await loadImageAsDataUrl(file);
    const img = new window.Image();
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });
    
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) throw new Error("Could not get canvas context");
    
    // For JPG, fill with white background (no transparency)
    if (toFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        toFormat,
        quality / 100
      );
    });
  };

  const imagesToPdf = async (files: File[]): Promise<Blob> => {
    const pdf = new jsPDF();
    let isFirstPage = true;
    
    for (const file of files) {
      const dataUrl = await loadImageAsDataUrl(file);
      const img = new window.Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
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
      
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;
      
      const format = file.type === "image/png" ? "PNG" : "JPEG";
      pdf.addImage(dataUrl, format, x, y, imgWidth, imgHeight);
    }
    
    return pdf.output("blob");
  };

  const pdfToImages = async (file: File, toFormat: "png" | "jpeg"): Promise<Blob[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const blobs: Blob[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2; // Higher scale for better quality
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");
      
      // Fill white background for JPEG
      if (toFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error("Failed to create blob")),
          `image/${toFormat}`,
          quality / 100
        );
      });
      
      blobs.push(blob);
    }
    
    return blobs;
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

  const handleConvert = async () => {
    if (!selectedConversion || uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { id } = selectedConversion;
      
      // Image to image conversions
      if (["jpg-to-png", "png-to-jpg", "webp-to-png", "webp-to-jpg", "png-to-webp", "jpg-to-webp"].includes(id)) {
        const formatMap: Record<string, string> = {
          "jpg-to-png": "image/png",
          "png-to-jpg": "image/jpeg",
          "webp-to-png": "image/png",
          "webp-to-jpg": "image/jpeg",
          "png-to-webp": "image/webp",
          "jpg-to-webp": "image/webp",
        };
        const extMap: Record<string, string> = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/webp": "webp",
        };
        
        const toFormat = formatMap[id];
        const blob = await convertImageFormat(uploadedFiles[0], toFormat);
        const baseName = uploadedFiles[0].name.replace(/\.[^/.]+$/, "");
        downloadBlob(blob, `${baseName}.${extMap[toFormat]}`);
        toast({ title: "Conversion complete!", description: `File converted to ${selectedConversion.to}` });
      }
      
      // Image(s) to PDF
      else if (["jpg-to-pdf", "png-to-pdf", "images-to-pdf"].includes(id)) {
        const pdfBlob = await imagesToPdf(uploadedFiles);
        downloadBlob(pdfBlob, "converted.pdf");
        toast({ title: "PDF created!", description: `${uploadedFiles.length} image(s) converted to PDF` });
      }
      
      // PDF to images
      else if (["pdf-to-jpg", "pdf-to-png"].includes(id)) {
        const toFormat = id === "pdf-to-jpg" ? "jpeg" : "png";
        const ext = id === "pdf-to-jpg" ? "jpg" : "png";
        const blobs = await pdfToImages(uploadedFiles[0], toFormat);
        
        blobs.forEach((blob, index) => {
          downloadBlob(blob, `page-${index + 1}.${ext}`);
        });
        
        toast({ title: "Conversion complete!", description: `${blobs.length} page(s) extracted as ${selectedConversion.to}` });
      }
      
      // Document/Presentation conversions (show info)
      else if (["word-to-pdf", "pdf-to-word", "ppt-to-pdf", "pdf-to-ppt", "images-to-ppt"].includes(id)) {
        toast({ 
          title: "Server-side conversion required",
          description: "This conversion type requires backend processing. Coming soon!",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error(error);
      toast({ title: "Conversion failed", description: "An error occurred during conversion.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredConversions = conversionTypes.filter((c) => c.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <FileType className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">File Converter</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedConversion ? (
            <>
              {/* Category Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: "image" as const, label: "Image", icon: Image },
                  { id: "document" as const, label: "Document", icon: FileText },
                  { id: "presentation" as const, label: "Presentation", icon: Presentation },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "glass hover:bg-primary/10"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Conversion Options Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredConversions.map((conversion) => (
                  <button
                    key={conversion.id}
                    onClick={() => setSelectedConversion(conversion)}
                    className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <conversion.fromIcon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">{conversion.from}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <conversion.toIcon className="w-5 h-5 text-accent" />
                        </div>
                        <span className="font-semibold text-sm">{conversion.to}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{conversion.description}</p>
                  </button>
                ))}
              </div>

              {/* Popular conversions hint */}
              <div className="mt-6 p-4 glass rounded-xl">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Popular Conversions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["jpg-to-png", "images-to-pdf", "pdf-to-jpg", "png-to-webp"].map((id) => {
                    const conv = conversionTypes.find((c) => c.id === id);
                    return conv ? (
                      <button
                        key={id}
                        onClick={() => {
                          setActiveCategory(conv.category);
                          setSelectedConversion(conv);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs hover:bg-primary/20 transition-colors"
                      >
                        {conv.from} → {conv.to}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Back button */}
              <button
                onClick={() => {
                  setSelectedConversion(null);
                  setUploadedFiles([]);
                }}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                ← Back to all conversions
              </button>

              {/* Selected conversion info */}
              <div className="flex items-center gap-4 mb-6 p-4 glass rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <selectedConversion.fromIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold">{selectedConversion.from}</span>
                    <p className="text-xs text-muted-foreground">Input format</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <selectedConversion.toIcon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <span className="font-semibold">{selectedConversion.to}</span>
                    <p className="text-xs text-muted-foreground">Output format</p>
                  </div>
                </div>
              </div>

              {/* File upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedConversion.accept}
                  multiple={selectedConversion.id === "images-to-pdf" || selectedConversion.id === "images-to-ppt"}
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
                  <p className="text-lg font-medium mb-2">Drop your {selectedConversion.from} file(s) here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium">Files to convert ({uploadedFiles.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                        <div className="flex items-center gap-3">
                          <File className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality slider for image conversions */}
              {["jpg-to-png", "png-to-jpg", "webp-to-png", "webp-to-jpg", "png-to-webp", "jpg-to-webp", "pdf-to-jpg", "pdf-to-png"].includes(selectedConversion.id) && (
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

              {/* Convert button */}
              <button
                onClick={handleConvert}
                disabled={isProcessing || uploadedFiles.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert & Download
                  </>
                )}
              </button>

              {/* Info for server-side conversions */}
              {["word-to-pdf", "pdf-to-word", "ppt-to-pdf", "pdf-to-ppt", "images-to-ppt"].includes(selectedConversion.id) && (
                <p className="mt-4 text-xs text-center text-muted-foreground">
                  This conversion type requires server-side processing and will be available soon.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConverterEditor;
