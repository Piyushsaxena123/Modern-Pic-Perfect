import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  X, 
  Clock, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Loader2,
  Eye,
  Calendar,
  Filter
} from "lucide-react";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface EditingHistoryItem {
  id: string;
  user_id: string;
  original_image_url: string | null;
  edited_image_url: string | null;
  tool_type: string;
  settings: unknown;
  created_at: string;
}

interface ImageGalleryProps {
  onClose: () => void;
}

const ImageGallery = ({ onClose }: ImageGalleryProps) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<EditingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EditingHistoryItem | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be logged in to view your editing history.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("editing_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error loading history",
        description: "Could not load your editing history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("editing_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getToolLabel = (tool: string) => {
    const labels: Record<string, string> = {
      filter: "Photo Filter",
      crop: "Crop",
      collage: "Collage",
      compress: "Compress",
      clothing: "AI Clothing",
      bgremove: "Background Removal",
      faceenhance: "Face Enhance",
      passport: "Passport Photo",
      upscale: "AI Upscale",
      objectremove: "AI Object Removal",
      styletransfer: "AI Style Transfer",
    };
    return labels[tool] || tool;
  };

  const uniqueTools = [...new Set(history.map((item) => item.tool_type))];
  const filteredHistory = filter === "all" 
    ? history 
    : history.filter((item) => item.tool_type === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden glass-strong rounded-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold">Image Gallery</h3>
              <p className="text-sm text-muted-foreground">{history.length} edits saved</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Sidebar Filters */}
          <div className="w-48 border-r border-border p-4 space-y-2 overflow-y-auto">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Tool
            </h4>
            <button
              onClick={() => setFilter("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              All ({history.length})
            </button>
            {uniqueTools.map((tool) => (
              <button
                key={tool}
                onClick={() => setFilter(tool)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filter === tool ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                {getToolLabel(tool)} ({history.filter((h) => h.tool_type === tool).length})
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No editing history yet</p>
                <p className="text-sm text-muted-foreground">
                  Your edited images will appear here
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden glass border border-border hover:border-primary/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-secondary overflow-hidden">
                      {item.edited_image_url ? (
                        <img
                          src={item.edited_image_url}
                          alt="Edited"
                          className="w-full h-full object-cover"
                        />
                      ) : item.original_image_url ? (
                        <img
                          src={item.original_image_url}
                          alt="Original"
                          className="w-full h-full object-cover opacity-50"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {getToolLabel(item.tool_type)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {item.original_image_url && item.edited_image_url && (
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Compare
                          </button>
                        )}
                        {item.edited_image_url && (
                          <button
                            onClick={() => downloadImage(item.edited_image_url!, `edited-${item.id}.png`)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Before/After Modal */}
        {selectedItem && selectedItem.original_image_url && selectedItem.edited_image_url && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/90">
            <div className="w-full max-w-4xl">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg glass hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <BeforeAfterSlider
                beforeImage={selectedItem.original_image_url}
                afterImage={selectedItem.edited_image_url}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
