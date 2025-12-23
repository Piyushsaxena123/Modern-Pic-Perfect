import { useState } from "react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";

const categories = ["All", "Portraits", "Landscape", "Wedding", "Street"];

const portfolioItems = [
  {
    id: 1,
    image: portfolio1,
    title: "Elegant Portrait",
    category: "Portraits",
    description: "Studio portrait with dramatic lighting",
  },
  {
    id: 2,
    image: portfolio2,
    title: "Golden Sunrise",
    category: "Landscape",
    description: "Mountain lake at dawn",
  },
  {
    id: 3,
    image: portfolio3,
    title: "Love & Light",
    category: "Wedding",
    description: "Sunset silhouette ceremony",
  },
  {
    id: 4,
    image: portfolio4,
    title: "City Nights",
    category: "Street",
    description: "Rain-soaked urban scene",
  },
  {
    id: 5,
    image: portfolio5,
    title: "Nature's Art",
    category: "Landscape",
    description: "Macro morning dewdrops",
  },
  {
    id: 6,
    image: portfolio6,
    title: "Corporate Vision",
    category: "Portraits",
    description: "Executive headshot",
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="section-padding bg-charcoal">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
            Featured Work
          </p>
          <h2 className="heading-lg mb-6">Portfolio</h2>
          <p className="body-md max-w-2xl mx-auto">
            A curated selection of my finest work across various photography
            genres. Each image represents a unique story and creative vision.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground glow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg cursor-pointer opacity-0 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent transition-opacity duration-500 ${
                  hoveredId === item.id ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Content */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${
                  hoveredId === item.id
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <span className="text-primary text-xs font-medium tracking-widest uppercase">
                  {item.category}
                </span>
                <h3 className="text-xl font-display font-semibold mt-1 mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>

              {/* Border Glow on Hover */}
              <div
                className={`absolute inset-0 rounded-lg border-2 transition-all duration-500 ${
                  hoveredId === item.id
                    ? "border-primary/50 glow-sm"
                    : "border-transparent"
                }`}
              />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-4 transition-all duration-300 line-animate"
          >
            View Complete Gallery
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
