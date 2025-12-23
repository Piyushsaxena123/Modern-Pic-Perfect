import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Download,
  RotateCcw,
  Crop,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Circle,
  Lock,
  Unlock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cropImage, loadImageFromUrl, canvasToBlob } from "@/lib/imageProcessing";

interface CropEditorProps {
  onClose: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatioPreset = {
  name: string;
  ratio: number | null;
  icon: any;
};

const aspectRatioPresets: AspectRatioPreset[] = [
  { name: "Free", ratio: null, icon: Unlock },
  { name: "1:1", ratio: 1, icon: Square },
  { name: "16:9", ratio: 16 / 9, icon: RectangleHorizontal },
  { name: "9:16", ratio: 9 / 16, icon: RectangleVertical },
  { name: "4:3", ratio: 4 / 3, icon: RectangleHorizontal },
  { name: "3:4", ratio: 3 / 4, icon: RectangleVertical },
];

const CropEditor = ({ onClose }: CropEditorProps) => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("Free");
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when URL changes
  useEffect(() => {
    if (uploadedImage) {
      loadImageFromUrl(uploadedImage).then((img) => {
        setImageElement(img);
        // Initialize crop area in center
        const containerWidth = containerRef.current?.clientWidth || 600;
        const containerHeight = 400;
        const imgScale = Math.min(containerWidth / img.naturalWidth, containerHeight / img.naturalHeight, 1);
        setScale(imgScale);
        
        const displayWidth = img.naturalWidth * imgScale;
        const displayHeight = img.naturalHeight * imgScale;
        
        const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
        setCropArea({
          x: (displayWidth - initialSize) / 2,
          y: (displayHeight - initialSize) / 2,
          width: initialSize,
          height: aspectRatio ? initialSize / aspectRatio : initialSize,
        });
      }).catch(console.error);
    }
  }, [uploadedImage]);

  // Handle aspect ratio change
  useEffect(() => {
    if (aspectRatio && imageElement) {
      const newHeight = cropArea.width / aspectRatio;
      const displayHeight = imageElement.naturalHeight * scale;
      
      if (cropArea.y + newHeight > displayHeight) {
        const adjustedHeight = Math.min(newHeight, displayHeight - cropArea.y);
        const adjustedWidth = adjustedHeight * aspectRatio;
        setCropArea((prev) => ({
          ...prev,
          width: adjustedWidth,
          height: adjustedHeight,
        }));
      } else {
        setCropArea((prev) => ({
          ...prev,
          height: newHeight,
        }));
      }
    }
  }, [aspectRatio]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({ title: "Image uploaded!", description: "Drag the handles to crop your image." });
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
        toast({ title: "Image uploaded!", description: "Drag the handles to crop your image." });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const getMousePosition = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(handle);
    const pos = getMousePosition(e);
    setDragStart({
      x: pos.x,
      y: pos.y,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropW: cropArea.width,
      cropH: cropArea.height,
    });
  };

  const constrainCropArea = (newCrop: CropArea): CropArea => {
    if (!imageElement) return newCrop;
    
    const displayWidth = imageElement.naturalWidth * scale;
    const displayHeight = imageElement.naturalHeight * scale;
    
    let { x, y, width, height } = newCrop;
    
    // Minimum size
    width = Math.max(40, width);
    height = Math.max(40, height);
    
    // Constrain to image bounds
    x = Math.max(0, Math.min(x, displayWidth - width));
    y = Math.max(0, Math.min(y, displayHeight - height));
    width = Math.min(width, displayWidth - x);
    height = Math.min(height, displayHeight - y);
    
    return { x, y, width, height };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageElement) return;
    
    const pos = getMousePosition(e);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;
    
    const displayWidth = imageElement.naturalWidth * scale;
    const displayHeight = imageElement.naturalHeight * scale;
    
    let newCrop = { ...cropArea };
    
    if (isDragging === "move") {
      newCrop.x = dragStart.cropX + deltaX;
      newCrop.y = dragStart.cropY + deltaY;
    } else {
      const isTop = isDragging.includes("t");
      const isBottom = isDragging.includes("b");
      const isLeft = isDragging.includes("l");
      const isRight = isDragging.includes("r");
      
      if (isRight) {
        newCrop.width = Math.max(40, dragStart.cropW + deltaX);
      }
      if (isBottom) {
        newCrop.height = Math.max(40, dragStart.cropH + deltaY);
      }
      if (isLeft) {
        const newWidth = dragStart.cropW - deltaX;
        if (newWidth >= 40) {
          newCrop.x = dragStart.cropX + deltaX;
          newCrop.width = newWidth;
        }
      }
      if (isTop) {
        const newHeight = dragStart.cropH - deltaY;
        if (newHeight >= 40) {
          newCrop.y = dragStart.cropY + deltaY;
          newCrop.height = newHeight;
        }
      }
      
      // Maintain aspect ratio if set
      if (aspectRatio) {
        if (isRight || isLeft) {
          newCrop.height = newCrop.width / aspectRatio;
          if (isTop) {
            newCrop.y = dragStart.cropY + dragStart.cropH - newCrop.height;
          }
        } else if (isTop || isBottom) {
          newCrop.width = newCrop.height * aspectRatio;
          if (isLeft) {
            newCrop.x = dragStart.cropX + dragStart.cropW - newCrop.width;
          }
        }
      }
    }
    
    setCropArea(constrainCropArea(newCrop));
  }, [isDragging, dragStart, cropArea, aspectRatio, imageElement, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handlePresetSelect = (preset: AspectRatioPreset) => {
    setSelectedPreset(preset.name);
    setAspectRatio(preset.ratio);
  };

  const handleReset = () => {
    if (imageElement) {
      const displayWidth = imageElement.naturalWidth * scale;
      const displayHeight = imageElement.naturalHeight * scale;
      const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCropArea({
        x: (displayWidth - initialSize) / 2,
        y: (displayHeight - initialSize) / 2,
        width: initialSize,
        height: initialSize,
      });
      setAspectRatio(null);
      setSelectedPreset("Free");
    }
    toast({ title: "Crop area reset" });
  };

  const handleCrop = async () => {
    if (!imageElement) return;
    
    setIsProcessing(true);
    try {
      // Convert display coordinates to actual image coordinates
      const actualX = Math.round(cropArea.x / scale);
      const actualY = Math.round(cropArea.y / scale);
      const actualWidth = Math.round(cropArea.width / scale);
      const actualHeight = Math.round(cropArea.height / scale);
      
      const croppedCanvas = cropImage(imageElement, actualX, actualY, actualWidth, actualHeight);
      
      // Download the cropped image
      const blob = await canvasToBlob(croppedCanvas, "image/png");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "picperfect-cropped.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: "Image cropped!", description: "Your cropped image has been downloaded." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to crop image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const displayWidth = imageElement ? imageElement.naturalWidth * scale : 0;
  const displayHeight = imageElement ? imageElement.naturalHeight * scale : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Crop className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold">Crop Editor</h3>
          </div>
          <div className="flex items-center gap-3">
            {uploadedImage && (
              <>
                <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button 
                  onClick={handleCrop} 
                  disabled={isProcessing}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Crop & Download"}
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
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="crop-image-upload" />
              <label htmlFor="crop-image-upload" className="cursor-pointer">
                <div className="w-20 h-20 rounded-2xl glass mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-medium mb-2">Drop your image here</p>
                <p className="text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-4">Supports: JPG, PNG, WebP, GIF</p>
              </label>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Preview with crop overlay */}
              <div className="lg:col-span-3">
                <div 
                  ref={containerRef}
                  className="relative rounded-xl overflow-hidden glass p-2 select-none"
                  style={{ cursor: isDragging ? "grabbing" : "default" }}
                >
                  <div className="relative inline-block">
                    {/* Image */}
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg"
                      style={{ 
                        maxHeight: "400px",
                        width: displayWidth || "auto",
                        height: displayHeight || "auto"
                      }}
                      draggable={false}
                    />
                    
                    {/* Dark overlay outside crop area */}
                    <div 
                      className="absolute inset-0 bg-black/60 pointer-events-none rounded-lg"
                      style={{
                        clipPath: `polygon(
                          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                          ${cropArea.x}px ${cropArea.y}px,
                          ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                          ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                          ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                          ${cropArea.x}px ${cropArea.y}px
                        )`,
                      }}
                    />
                    
                    {/* Crop selection area */}
                    <div
                      className="absolute border-2 border-primary bg-transparent cursor-move"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, "move")}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/40" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/40" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/40" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/40" />
                      </div>
                      
                      {/* Corner handles */}
                      {["tl", "tr", "bl", "br"].map((corner) => (
                        <div
                          key={corner}
                          className="absolute w-4 h-4 bg-primary border-2 border-white rounded-sm shadow-lg"
                          style={{
                            ...(corner.includes("t") ? { top: -8 } : { bottom: -8 }),
                            ...(corner.includes("l") ? { left: -8 } : { right: -8 }),
                            cursor: corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize",
                          }}
                          onMouseDown={(e) => handleMouseDown(e, corner)}
                        />
                      ))}
                      
                      {/* Edge handles */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -top-2 w-8 h-3 bg-primary rounded-sm cursor-n-resize shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, "t")}
                      />
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-8 h-3 bg-primary rounded-sm cursor-s-resize shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, "b")}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -left-2 w-3 h-8 bg-primary rounded-sm cursor-w-resize shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, "l")}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -right-2 w-3 h-8 bg-primary rounded-sm cursor-e-resize shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, "r")}
                      />
                      
                      {/* Dimensions label */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded whitespace-nowrap">
                        {Math.round(cropArea.width / scale)} × {Math.round(cropArea.height / scale)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-primary" />
                    Aspect Ratio
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {aspectRatioPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedPreset === preset.name
                            ? "bg-primary text-primary-foreground"
                            : "glass hover:bg-primary/10"
                        }`}
                      >
                        <preset.icon className="w-4 h-4" />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4 glass rounded-xl">
                  <h5 className="text-sm font-medium mb-2">Crop Info</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Position: {Math.round(cropArea.x / scale)}, {Math.round(cropArea.y / scale)}</p>
                    <p>Size: {Math.round(cropArea.width / scale)} × {Math.round(cropArea.height / scale)}</p>
                    {aspectRatio && <p>Ratio: {selectedPreset}</p>}
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="p-4 glass rounded-xl">
                  <h5 className="text-sm font-medium mb-2">How to use</h5>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Drag corners to resize</li>
                    <li>• Drag edges for single axis</li>
                    <li>• Drag center to move</li>
                    <li>• Select aspect ratio preset</li>
                  </ul>
                </div>

                {/* Upload new image */}
                <div className="pt-4 border-t border-border">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="new-crop-image" />
                  <label
                    htmlFor="new-crop-image"
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

export default CropEditor;
