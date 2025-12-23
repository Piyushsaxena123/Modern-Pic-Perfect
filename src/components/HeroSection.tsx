import { useState, useEffect } from "react";
import { ArrowRight, Play, X } from "lucide-react";
import heroPhoto1 from "@/assets/hero-photo-1.jpg";
import heroPhoto2 from "@/assets/hero-photo-2.jpg";
import heroPhoto3 from "@/assets/hero-photo-3.jpg";

const heroImages = [
  { src: heroPhoto1, alt: "Photographer capturing sunset moments" },
  { src: heroPhoto2, alt: "Creative photo editing workspace" },
  { src: heroPhoto3, alt: "Stunning mountain landscape photography" },
];

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 opacity-0 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-muted-foreground">AI-Powered Image Editing</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Transform Your
              <br />
              <span className="gradient-text">Images</span> with
              <br />
              Perfection
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Professional-grade image editing tools. Create stunning collages, apply filters, resize, crop, and convert your images effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <button onClick={onGetStarted} className="btn-primary flex items-center justify-center gap-2 group">
                Start Editing Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 justify-center lg:justify-start mt-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div>
                <p className="text-3xl font-display font-bold gradient-text">50K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-display font-bold gradient-text">1M+</p>
                <p className="text-sm text-muted-foreground">Images Edited</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-display font-bold gradient-text">4.9</p>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image/Visual with Carousel */}
          <div className="relative opacity-0 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl gradient-bg opacity-20 blur-3xl animate-pulse-glow" />
              
              {/* Main image container with carousel */}
              <div className="relative rounded-3xl overflow-hidden glass p-2">
                {heroImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.src}
                    alt={image.alt}
                    className={`absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-2xl transition-opacity duration-1000 ${
                      index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                {/* Static placeholder for sizing */}
                <img
                  src={heroImages[0].src}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl opacity-0"
                  aria-hidden="true"
                />
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImage
                          ? "bg-primary w-6"
                          : "bg-foreground/30 hover:bg-foreground/50"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 glass rounded-xl p-3 animate-float z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Auto Enhance</p>
                      <p className="text-xs text-muted-foreground">1-Click Magic</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 glass rounded-xl p-3 animate-float z-20" style={{ animationDelay: "-2s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground text-xs font-bold">HD</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">High Quality</p>
                      <p className="text-xs text-muted-foreground">Lossless Export</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={() => setShowDemo(false)}
          />
          <div className="relative w-full max-w-4xl glass rounded-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Watch Demo
              </h3>
              <button 
                onClick={() => setShowDemo(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Video Content */}
            <div className="aspect-video bg-secondary/50">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                title="PicPerfect Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Learn how to use PicPerfect's powerful editing tools to transform your photos
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
