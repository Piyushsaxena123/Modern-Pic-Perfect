import { useState, useEffect } from "react";
import { ChevronDown, Play, X } from "lucide-react";
import heroPhoto1 from "@/assets/hero-photo-1.jpg";
import heroPhoto2 from "@/assets/hero-photo-2.jpg";
import heroPhoto3 from "@/assets/hero-photo-3.jpg";

const heroImages = [
  { src: heroPhoto1, alt: "Photographer capturing sunset moments" },
  { src: heroPhoto2, alt: "Creative photo editing workspace" },
  { src: heroPhoto3, alt: "Stunning mountain landscape photography" },
];

const Hero = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              index === currentImage ? "opacity-50" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImage
                ? "bg-primary w-8"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide section-padding text-center">
        <div className="max-w-4xl mx-auto">
          {/* Tagline */}
          <p
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm md:text-base mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Professional Photography
          </p>

          {/* Main Heading */}
          <h1
            className="heading-xl mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Capturing <span className="text-gradient italic">Moments</span>
            <br />
            That Last Forever
          </h1>

          {/* Description */}
          <p
            className="body-lg max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            Award-winning photographer specializing in portraits, weddings, and
            commercial photography. Every frame tells a story.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <a
              href="#portfolio"
              className="px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-gold-light transition-all duration-300 glow-sm hover:glow min-w-[180px]"
            >
              View Portfolio
            </a>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:border-primary hover:text-primary transition-all duration-300 min-w-[180px] flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#portfolio"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-float"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={20} />
        </a>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-px h-32 bg-gradient-to-b from-transparent via-primary/50 to-transparent hidden lg:block" />
      <div className="absolute bottom-1/4 left-10 w-px h-32 bg-gradient-to-b from-transparent via-primary/50 to-transparent hidden lg:block" />

      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={() => setShowDemo(false)}
          />
          <div className="relative w-full max-w-4xl glass-strong rounded-2xl overflow-hidden animate-scale-in">
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

export default Hero;
