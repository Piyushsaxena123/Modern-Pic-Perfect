import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import FooterSection from "@/components/FooterSection";
import ToolModal from "@/components/ToolModal";
import FilterEditor from "@/components/FilterEditor";
import CropEditor from "@/components/CropEditor";
import CollageEditor from "@/components/CollageEditor";
import ConverterEditor from "@/components/ConverterEditor";
import SaveEditor from "@/components/SaveEditor";
import CompressEditor from "@/components/CompressEditor";
import ClothingEditor from "@/components/ClothingEditor";
import FaceEnhanceEditor from "@/components/FaceEnhanceEditor";
import BackgroundRemover from "@/components/BackgroundRemover";
import PassportCropper from "@/components/PassportCropper";
import BatchProcessor from "@/components/BatchProcessor";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === "tools") {
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const advancedTools = ["filter", "crop", "collage", "converter", "save", "compress", "clothing", "faceenhance", "bgremove", "passport", "batch"];

  const getToolTitle = (tool: string) => {
    const titles: Record<string, string> = {
      filter: "Photo Filters",
      crop: "Visual Crop",
      collage: "Collage Maker",
      converter: "File Converter",
      save: "Batch Save",
      compress: "Image Compressor",
      clothing: "AI Clothing Changer",
      faceenhance: "Face Enhancer",
      bgremove: "Background Remover",
      passport: "Passport Photo Cropper",
      batch: "Batch Processor",
    };
    return titles[tool] || tool;
  };

  return (
    <>
      <Helmet>
        <title>PicPerfect | Professional Image Editing Tools</title>
        <meta
          name="description"
          content="Transform your images with PicPerfect. Professional-grade tools for collage, filters, resize, crop, AI clothing change, face enhancement, background removal and format conversion. Free online image editor."
        />
        <meta
          name="keywords"
          content="image editor, photo editor, collage maker, image filter, resize image, crop image, image converter, AI clothing changer, passport photo, background remover, face enhancer, online editor"
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
        
        <main>
          <HeroSection onGetStarted={() => handleNavigate("tools")} />
          <ToolsSection onToolSelect={handleToolSelect} />
        </main>

        <FooterSection />

        {/* Full-screen Tool Editors */}
        {selectedTool && advancedTools.includes(selectedTool) && (
          <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
            <div className="sticky top-0 z-10 glass-strong border-b border-border">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold gradient-text">
                  {getToolTitle(selectedTool)}
                </h2>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  ← Back to Tools
                </button>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
              {selectedTool === "filter" && <FilterEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "crop" && <CropEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "collage" && <CollageEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "converter" && <ConverterEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "save" && <SaveEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "compress" && <CompressEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "clothing" && <ClothingEditor onClose={() => setSelectedTool(null)} />}
              {selectedTool === "faceenhance" && <FaceEnhanceEditor />}
              {selectedTool === "bgremove" && <BackgroundRemover />}
              {selectedTool === "passport" && <PassportCropper />}
              {selectedTool === "batch" && <BatchProcessor />}
            </div>
          </div>
        )}

        {/* Other Tool Modals (resize, feedback) */}
        {selectedTool && !advancedTools.includes(selectedTool) && (
          <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
        )}
      </div>
    </>
  );
};

export default Index;