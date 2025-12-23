import { Camera, Award, Users, Image } from "lucide-react";
import heroCamera from "@/assets/hero-camera.png";

const stats = [
  { icon: Camera, value: "15+", label: "Years Experience" },
  { icon: Award, value: "50+", label: "Awards Won" },
  { icon: Users, value: "500+", label: "Happy Clients" },
  { icon: Image, value: "10K+", label: "Photos Delivered" },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={heroCamera}
                alt="Professional photography equipment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 md:right-6 bg-primary text-primary-foreground px-8 py-6 rounded-lg glow">
              <p className="font-display text-4xl font-bold">15+</p>
              <p className="text-sm font-medium">Years of Excellence</p>
            </div>

            {/* Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-primary/50" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-primary/50" />
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
              About Me
            </p>
            <h2 className="heading-lg mb-6">
              Passionate About
              <br />
              <span className="text-gradient italic">Visual Stories</span>
            </h2>

            <div className="space-y-6 mb-10">
              <p className="body-lg">
                Photography isn't just my profession—it's my passion. For over
                15 years, I've been capturing the beauty in everyday moments and
                transforming them into timeless memories.
              </p>
              <p className="body-md">
                My journey began with a simple point-and-shoot camera, and has
                evolved into a pursuit of artistic excellence. I specialize in
                portrait, wedding, and commercial photography, bringing a unique
                blend of technical precision and creative vision to every
                project.
              </p>
              <p className="body-md">
                Based in New York, I work with clients worldwide, delivering
                images that don't just capture moments—they tell stories.
              </p>
            </div>

            {/* Signature */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-px bg-primary" />
              <p className="font-display text-2xl italic text-primary">
                James Mitchell
              </p>
            </div>

            {/* CTA */}
            <a
              href="#contact"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-gold-light transition-all duration-300 glow-sm hover:glow"
            >
              Let's Work Together
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16 border-t border-border">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="font-display text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
