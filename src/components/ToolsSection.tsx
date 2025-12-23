import {
  LayoutGrid,
  SlidersHorizontal,
  Download,
  Maximize2,
  Crop,
  FileType,
  MessageSquare,
  ArrowRight,
  Minimize2,
  Shirt,
  Sparkles,
  Zap,
  ImageOff,
  Smile,
  Camera,
  Layers,
  FileText,
} from "lucide-react";

interface ToolsSectionProps {
  onToolSelect: (tool: string) => void;
}

const tools = [
  {
    id: "collage",
    icon: LayoutGrid,
    title: "Collage Maker",
    description: "Create stunning photo collages with 8+ layouts and customizable spacing.",
    color: "from-violet-500 to-purple-600",
    badge: null,
  },
  {
    id: "filter",
    icon: SlidersHorizontal,
    title: "Photo Filters",
    description: "Apply 8+ professional filters like brightness, contrast, saturation & more.",
    color: "from-pink-500 to-rose-600",
    badge: null,
  },
  {
    id: "clothing",
    icon: Shirt,
    title: "AI Clothing Changer",
    description: "Transform casual photos into professional attire for documents & forms.",
    color: "from-fuchsia-500 to-pink-600",
    badge: "AI",
  },
  {
    id: "bgremove",
    icon: ImageOff,
    title: "Background Remover",
    description: "Remove backgrounds instantly with AI. Perfect for passport & product photos.",
    color: "from-cyan-500 to-blue-600",
    badge: "AI",
  },
  {
    id: "faceenhance",
    icon: Smile,
    title: "Face Enhancer",
    description: "Skin smoothing, teeth whitening, blemish removal for professional photos.",
    color: "from-rose-500 to-pink-600",
    badge: "PRO",
  },
  {
    id: "passport",
    icon: Camera,
    title: "Passport Photo",
    description: "Create passport photos with standard sizes (2×2 inch, 35×45mm) & auto-centering.",
    color: "from-green-500 to-emerald-600",
    badge: "NEW",
  },
  {
    id: "batch",
    icon: Layers,
    title: "Batch Processor",
    description: "Process multiple images at once for clothing change or background removal.",
    color: "from-purple-500 to-indigo-600",
    badge: "NEW",
  },
  {
    id: "compress",
    icon: Minimize2,
    title: "Image Compressor",
    description: "Reduce file size up to 80% while maintaining quality. See live preview.",
    color: "from-amber-500 to-orange-600",
    badge: null,
  },
  {
    id: "crop",
    icon: Crop,
    title: "Visual Crop",
    description: "Precise cropping with draggable handles & preset ratios for social media.",
    color: "from-emerald-500 to-teal-600",
    badge: null,
  },
  {
    id: "resize",
    icon: Maximize2,
    title: "Image Resize",
    description: "Resize images for HD, 4K, Instagram, Twitter with aspect ratio lock.",
    color: "from-blue-500 to-cyan-600",
    badge: null,
  },
  {
    id: "converter",
    icon: FileType,
    title: "File Converter",
    description: "Convert JPG, PNG, PDF, WebP & more. 15+ conversion types supported.",
    color: "from-indigo-500 to-blue-600",
    badge: null,
  },
  {
    id: "save",
    icon: Download,
    title: "Batch Save",
    description: "Export multiple images in PNG, JPG, WebP or PDF format at once.",
    color: "from-teal-500 to-cyan-600",
    badge: null,
  },
  {
    id: "imagetodoc",
    icon: FileText,
    title: "Images to Document",
    description: "Convert 100+ images to PDF, PPT, or Word document in one click.",
    color: "from-blue-500 to-indigo-600",
    badge: "NEW",
  },
];

const ToolsSection = ({ onToolSelect }: ToolsSectionProps) => {
  return (
    <section id="tools" className="relative py-24 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[200px] bg-pink-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6 animate-pulse-glow">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Powerful Tools</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Everything You Need to
            <br />
            <span className="gradient-text">Edit Like a Pro</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools designed for both beginners and experts. No downloads required.
          </p>
        </div>

        {/* Tools Grid - Improved layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="group relative p-5 rounded-2xl glass hover-lift cursor-pointer overflow-hidden border border-transparent hover:border-primary/30 transition-all duration-500"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                animation: `fade-in-up 0.5s ease-out ${index * 0.05}s forwards`
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-5`} />
              </div>
              
              {/* Badge */}
              {tool.badge && (
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tool.badge === "AI" 
                    ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white" 
                    : tool.badge === "PRO"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "bg-accent text-accent-foreground"
                }`}>
                  {tool.badge === "AI" && <Sparkles className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                  {tool.badge}
                </div>
              )}
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 bg-gradient-to-br ${tool.color}`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-base font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
                {tool.description}
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                <span>Open Tool</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Feedback CTA - Enhanced */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 glass-strong rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-float">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-semibold text-lg">Have Feedback?</h4>
                <p className="text-sm text-muted-foreground">Help us improve PicPerfect</p>
              </div>
            </div>
            <button
              onClick={() => onToolSelect("feedback")}
              className="btn-secondary hover:btn-primary transition-all"
            >
              Share Feedback
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;