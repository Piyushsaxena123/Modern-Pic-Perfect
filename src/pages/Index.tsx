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

  return (
    <>
      <Helmet>
        <title>PicPerfect | Professional Image Editing Tools</title>
        <meta
          name="description"
          content="Transform your images with PicPerfect. Professional-grade tools for collage, filters, resize, crop, and format conversion. Free online image editor."
        />
        <meta
          name="keywords"
          content="image editor, photo editor, collage maker, image filter, resize image, crop image, image converter, online editor"
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
        
        <main>
          <HeroSection onGetStarted={() => handleNavigate("tools")} />
          <ToolsSection onToolSelect={handleToolSelect} />
        </main>

        <FooterSection />

        {/* Filter Editor */}
        {selectedTool === "filter" && (
          <FilterEditor onClose={() => setSelectedTool(null)} />
        )}

        {/* Crop Editor */}
        {selectedTool === "crop" && (
          <CropEditor onClose={() => setSelectedTool(null)} />
        )}

        {/* Collage Editor */}
        {selectedTool === "collage" && (
          <CollageEditor onClose={() => setSelectedTool(null)} />
        )}

        {/* Other Tool Modals */}
        {selectedTool && !["filter", "crop", "collage"].includes(selectedTool) && (
          <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
        )}
      </div>
    </>
  );
};

export default Index;
