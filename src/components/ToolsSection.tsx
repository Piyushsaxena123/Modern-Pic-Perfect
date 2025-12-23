import {
  LayoutGrid,
  SlidersHorizontal,
  Download,
  Maximize2,
  Crop,
  FileType,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

interface ToolsSectionProps {
  onToolSelect: (tool: string) => void;
}

const tools = [
  {
    id: "collage",
    icon: LayoutGrid,
    title: "Collage",
    description: "Create stunning photo collages with customizable layouts and styles.",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "filter",
    icon: SlidersHorizontal,
    title: "Filter",
    description: "Apply professional filters and effects to enhance your photos.",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "save",
    icon: Download,
    title: "Save",
    description: "Export your work in multiple formats with quality options.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "resize",
    icon: Maximize2,
    title: "Resize",
    description: "Resize images while maintaining aspect ratio and quality.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "crop",
    icon: Crop,
    title: "Crop",
    description: "Precise cropping tools with preset ratios for social media.",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "converter",
    icon: FileType,
    title: "Converter",
    description: "Convert between image formats: PNG, JPG, WebP, and more.",
    color: "from-indigo-500 to-blue-600",
  },
];

const ToolsSection = ({ onToolSelect }: ToolsSectionProps) => {
  return (
    <section id="tools" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-primary mb-4">
            Powerful Tools
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
            Everything You Need to
            <br />
            <span className="gradient-text">Edit Like a Pro</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools designed for both beginners and experts. No downloads required.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="tool-card opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`tool-card-icon bg-gradient-to-br ${tool.color}`}>
                <tool.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {tool.description}
              </p>
              <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Try Now</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Feedback CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 glass rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-display font-semibold">Have Feedback?</h4>
              <p className="text-sm text-muted-foreground">We'd love to hear from you</p>
            </div>
            <button
              onClick={() => onToolSelect("feedback")}
              className="btn-primary text-sm ml-4"
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
