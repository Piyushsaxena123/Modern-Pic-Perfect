import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import MainContent from "@/components/MainContent";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("collage");
  const [searchQuery, setSearchQuery] = useState("");

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    setSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Pic Perfect | Image Editing Tools</title>
        <meta
          name="description"
          content="Professional image editing tools - Create collages, apply filters, resize, crop, and convert your images with ease."
        />
        <meta
          name="keywords"
          content="image editor, collage maker, photo filter, resize images, crop photos, image converter"
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />

        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <MainContent activeItem={activeItem} />
      </div>
    </>
  );
};

export default Index;
