import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Download, 
  Loader2, 
  Trash2, 
  Check, 
  X, 
  Shirt, 
  ImageOff,
  Package,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ProcessType = "clothing" | "background";
type ClothingType = "school-uniform" | "office-tie" | "formal-suit" | "formal-shirt";
type Gender = "male" | "female";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "processing" | "done" | "error";
  result?: string;
  error?: string;
}

const clothingOptions = [
  { id: "school-uniform", name: "School Uniform" },
  { id: "office-tie", name: "Office with Tie" },
  { id: "formal-suit", name: "Formal Suit" },
  { id: "formal-shirt", name: "Formal Shirt" },
];

const backgroundOptions = [
  { id: "white", color: "#FFFFFF", name: "White" },
  { id: "lightblue", color: "#E3F2FD", name: "Light Blue" },
  { id: "transparent", color: "transparent", name: "Transparent" },
  { id: "blue", color: "#1976D2", name: "Blue" },
];

const BatchProcessor = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processType, setProcessType] = useState<ProcessType>("clothing");
  const [clothingType, setClothingType] = useState<ClothingType>("school-uniform");
  const [gender, setGender] = useState<Gender>("male");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFilesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageItem[] = [];
    
    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ImageItem = {
          id: `${Date.now()}-${index}`,
          file,
          preview: event.target?.result as string,
          status: "pending",
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  const processImages = async () => {
    if (images.length === 0) {
      toast({ title: "No images", description: "Please upload images first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.status === "done") continue;

      // Update status to processing
      setImages(prev => prev.map(item => 
        item.id === img.id ? { ...item, status: "processing" as const } : item
      ));

      try {
        let result;
        
        if (processType === "clothing") {
          const { data, error } = await supabase.functions.invoke("ai-clothing", {
            body: {
              imageBase64: img.preview,
              clothingType,
              gender,
              style: "indian"
            }
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);
          result = data.image;
        } else {
          const prompt = backgroundColor === "transparent" 
            ? "Remove the background completely, making it transparent. Keep only the main subject."
            : `Remove the background and replace with solid ${backgroundColor} color. Keep only the main subject.`;

          const { data, error } = await supabase.functions.invoke("ai-background", {
            body: {
              imageBase64: img.preview,
              backgroundType: backgroundColor === "transparent" ? "transparent" : "color",
              backgroundColor,
              prompt
            }
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);
          result = data.image;
        }

        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: "done" as const, result } : item
        ));
      } catch (error: any) {
        console.error("Processing error:", error);
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: "error" as const, error: error.message } : item
        ));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
    toast({ title: "Batch complete!", description: "All images have been processed." });
  };

  const downloadAll = () => {
    const completedImages = images.filter(img => img.status === "done" && img.result);
    
    completedImages.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = img.result!;
        link.download = `processed-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });

    toast({ title: "Downloading...", description: `${completedImages.length} images being downloaded.` });
  };

  const downloadSingle = (img: ImageItem) => {
    if (!img.result) return;
    const link = document.createElement("a");
    link.href = img.result;
    link.download = `processed-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = images.filter(img => img.status === "done").length;
  const errorCount = images.filter(img => img.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Process Type Selection */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Batch Processing Type
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setProcessType("clothing")}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
              processType === "clothing" ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
            }`}
          >
            <Shirt className="w-6 h-6" />
            <div className="text-left">
              <p className="font-medium">Clothing Change</p>
              <p className={`text-xs ${processType === "clothing" ? "opacity-80" : "text-muted-foreground"}`}>
                Change attire on multiple photos
              </p>
            </div>
          </button>
          <button
            onClick={() => setProcessType("background")}
            className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
              processType === "background" ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
            }`}
          >
            <ImageOff className="w-6 h-6" />
            <div className="text-left">
              <p className="font-medium">Background Removal</p>
              <p className={`text-xs ${processType === "background" ? "opacity-80" : "text-muted-foreground"}`}>
                Remove/replace backgrounds
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Options based on type */}
      {processType === "clothing" ? (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="glass rounded-xl p-4">
            <label className="text-sm font-medium mb-3 block">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g as Gender)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    gender === g ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Clothing Type */}
          <div className="glass rounded-xl p-4">
            <label className="text-sm font-medium mb-3 block">Clothing Style</label>
            <div className="grid grid-cols-2 gap-2">
              {clothingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setClothingType(opt.id as ClothingType)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    clothingType === opt.id ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-4">
          <label className="text-sm font-medium mb-3 block">Background Color</label>
          <div className="flex flex-wrap gap-3">
            {backgroundOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBackgroundColor(opt.color)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  backgroundColor === opt.color ? "ring-2 ring-primary" : "glass hover:bg-primary/10"
                }`}
              >
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ 
                    backgroundColor: opt.color === "transparent" ? undefined : opt.color,
                    background: opt.color === "transparent" 
                      ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)"
                      : undefined,
                    backgroundSize: opt.color === "transparent" ? "8px 8px" : undefined,
                  }}
                />
                <span className="text-sm">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Images ({images.length})
          </h3>
          {images.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" />Clear All
            </Button>
          )}
        </div>

        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click or drag to upload multiple images</p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP</p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFilesUpload} 
            className="hidden" 
          />
        </label>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-secondary/30">
                <div className="aspect-square">
                  <img 
                    src={img.result || img.preview} 
                    alt="Upload" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center ${
                  img.status === "processing" ? "bg-background/80" : 
                  img.status === "done" ? "bg-green-500/20" :
                  img.status === "error" ? "bg-red-500/20" : ""
                }`}>
                  {img.status === "processing" && (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  )}
                  {img.status === "done" && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                  {img.status === "error" && (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.status === "done" && img.result && (
                    <button 
                      onClick={() => downloadSingle(img)}
                      className="p-1 rounded bg-background/80 hover:bg-background"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="p-1 rounded bg-background/80 hover:bg-background text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={processImages} 
          disabled={isProcessing || images.length === 0}
          className="flex-1 h-14 text-lg btn-primary"
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing {completedCount}/{images.length}...</>
          ) : (
            <><Sparkles className="w-5 h-5 mr-2" />Process All Images</>
          )}
        </Button>
        
        {completedCount > 0 && (
          <Button onClick={downloadAll} variant="outline" className="h-14">
            <Download className="w-5 h-5 mr-2" />
            Download All ({completedCount})
          </Button>
        )}
      </div>

      {/* Status */}
      {images.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Pending: {images.filter(i => i.status === "pending").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Done: {completedCount}</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Errors: {errorCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchProcessor;
