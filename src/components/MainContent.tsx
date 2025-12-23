import { useState, useEffect } from "react";
import heroPhoto1 from "@/assets/hero-photo-1.jpg";
import heroPhoto2 from "@/assets/hero-photo-2.jpg";
import heroPhoto3 from "@/assets/hero-photo-3.jpg";

const heroImages = [heroPhoto1, heroPhoto2, heroPhoto3];

interface MainContentProps {
  activeItem: string;
}

const contentTitles: Record<string, { title: string; description: string }> = {
  collage: {
    title: "Create Stunning Collages",
    description: "Combine multiple images into beautiful collage layouts",
  },
  filter: {
    title: "Apply Filters",
    description: "Enhance your photos with professional filters",
  },
  save: {
    title: "Save Your Work",
    description: "Export your edited images in various formats",
  },
  resize: {
    title: "Resize Images",
    description: "Adjust dimensions while maintaining quality",
  },
  crop: {
    title: "Crop & Frame",
    description: "Perfect composition with precise cropping tools",
  },
  converter: {
    title: "Format Converter",
    description: "Convert between image formats seamlessly",
  },
  feedback: {
    title: "We Value Your Feedback",
    description: "Help us improve your experience",
  },
};

const MainContent = ({ activeItem }: MainContentProps) => {
  const content = contentTitles[activeItem] || contentTitles.collage;
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="fixed inset-0 lg:left-72">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Professional photography"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 pt-24">
        <div className="text-center max-w-2xl opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-4xl md:text-6xl font-light mb-4">
            <span className="text-gradient">{content.title}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Action Area - Placeholder for future tools */}
        <div
          className="mt-12 w-full max-w-3xl opacity-0 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="border-2 border-dashed border-border rounded-2xl p-12 md:p-20 text-center bg-secondary/20 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300 cursor-pointer">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Drop your image here</p>
              <p className="text-sm">or click to browse</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="mt-8 flex flex-wrap justify-center gap-4 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-cyan-light transition-all duration-300 glow-sm">
            Upload Image
          </button>
          <button className="px-6 py-3 border border-border text-foreground font-medium rounded-full hover:border-primary hover:text-primary transition-all duration-300">
            Browse Templates
          </button>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
