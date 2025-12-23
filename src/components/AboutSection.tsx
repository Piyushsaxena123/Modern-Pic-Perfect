import { Mail, MapPin, Phone, Users, Target, Award } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            About <span className="gradient-text">PicPerfect</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make professional image editing accessible to everyone, 
            from beginners to experts.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-2xl glass hover-lift">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Built for Everyone</h3>
            <p className="text-muted-foreground">
              Whether you're a professional photographer or just getting started, our tools are 
              designed to be intuitive and powerful.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass hover-lift">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">
              Leverage the latest AI technology for background removal, style transfer, 
              image upscaling, and more.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass hover-lift">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">No Downloads</h3>
            <p className="text-muted-foreground">
              Everything runs in your browser. No software to install, no storage limits, 
              just open and start editing.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { value: "15+", label: "Editing Tools" },
            { value: "5+", label: "AI Features" },
            { value: "100%", label: "Free to Use" },
            { value: "24/7", label: "Available" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl glass">
              <div className="text-3xl font-display font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
