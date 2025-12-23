import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Download, Sparkles, Eraser, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface AIObjectRemovalEditorProps {
  onClose: () => void;
}

const AIObjectRemovalEditor = ({ onClose }: AIObjectRemovalEditorProps) => {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [maskData, setMaskData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
        setMaskData(null);

        // Setup canvases
        if (canvasRef.current && maskCanvasRef.current) {
          const canvas = canvasRef.current;
          const maskCanvas = maskCanvasRef.current;
          
          canvas.width = img.width;
          canvas.height = img.height;
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }

          const maskCtx = maskCanvas.getContext("2d");
          if (maskCtx) {
            maskCtx.fillStyle = "black";
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      if (!ctx || !maskCtx) return;

      // Draw on visible canvas (red overlay)
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw on mask canvas (white for area to remove)
      maskCtx.fillStyle = "white";
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize, 0, Math.PI * 2);
      maskCtx.fill();
    },
    [brushSize]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    draw(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    draw(x, y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (maskCanvasRef.current) {
      setMaskData(maskCanvasRef.current.toDataURL("image/png"));
    }
  };

  const clearMask = () => {
    if (!canvasRef.current || !maskCanvasRef.current || !originalImage) return;

    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      }

      const maskCtx = maskCanvasRef.current?.getContext("2d");
      if (maskCtx && maskCanvasRef.current) {
        maskCtx.fillStyle = "black";
        maskCtx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    };
    img.src = originalImage;
    setMaskData(null);
  };

  const handleRemoveObjects = async () => {
    if (!originalImage || !maskData) {
      toast({
        title: "Mark areas to remove",
        description: "Use the brush to mark objects you want to remove.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-edit", {
        body: {
          action: "objectremoval",
          imageUrl: originalImage,
          maskUrl: maskData,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setResultImage(data.imageUrl);
        toast({ title: "Objects removed successfully!" });

        // Save to history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("editing_history").insert({
            user_id: user.id,
            original_image_url: originalImage,
            edited_image_url: data.imageUrl,
            tool_type: "objectremove",
            settings: { brushSize },
          });
        }
      }
    } catch (error) {
      console.error("Object removal error:", error);
      toast({
        title: "Removal failed",
        description: "Could not remove objects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "object-removed.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <Eraser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold">AI Object Removal</h3>
            <p className="text-sm text-muted-foreground">Paint over objects to remove them</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!originalImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium mb-2">Upload an image</p>
          <p className="text-sm text-muted-foreground">Then paint over objects to remove</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Brush Size */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Brush Size:</span>
            <input
              type="range"
              min={10}
              max={100}
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-8">{brushSize}</span>
            <button
              onClick={clearMask}
              className="p-2 rounded-lg glass hover:bg-secondary transition-colors"
              title="Clear mask"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas */}
          {resultImage ? (
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={resultImage}
              beforeLabel="Original"
              afterLabel="Cleaned"
            />
          ) : (
            <div className="relative rounded-2xl overflow-hidden glass">
              <canvas
                ref={canvasRef}
                className="w-full h-auto cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <canvas ref={maskCanvasRef} className="hidden" />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg glass text-xs">
                Paint over objects to remove them
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOriginalImage(null);
                setResultImage(null);
                setMaskData(null);
              }}
              className="px-4 py-2 rounded-lg glass hover:bg-secondary transition-colors"
            >
              Upload New
            </button>
            <button
              onClick={handleRemoveObjects}
              disabled={isProcessing || !maskData}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Remove Objects
                </>
              )}
            </button>
            {resultImage && (
              <button
                onClick={downloadImage}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIObjectRemovalEditor;
